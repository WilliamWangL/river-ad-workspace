package com.river.module.coupon.dal.mysql;

import cn.hutool.core.collection.CollUtil;
import com.river.framework.common.enums.CommonStatusEnum;
import com.river.framework.common.pojo.PageParam;
import com.river.framework.common.pojo.PageResult;
import com.river.framework.mybatis.core.mapper.BaseMapperX;
import com.river.framework.mybatis.core.query.LambdaQueryWrapperX;
import com.river.module.coupon.controller.admin.deal.vo.DealPageReqVO;
import com.river.module.coupon.dal.dataobject.DealDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface DealMapper extends BaseMapperX<DealDO> {

    /**
     * 分类筛选查询的动态条件片段。
     * 自定义 SQL 不会经过 MyBatis-Plus 的逻辑删除/租户插件增强，
     * 逻辑删除条件需在此手动声明（租户条件仍由租户拦截器自动追加）。
     */
    String CATEGORY_CONDITIONS = ""
            + " AND dc.category_id = #{reqVO.categoryId} AND dc.deleted = 0 AND d.deleted = 0"
            + "<if test='reqVO.status != null'> AND d.status = #{reqVO.status}</if>"
            + "<if test='reqVO.merchantId != null'> AND d.merchant_id = #{reqVO.merchantId}</if>"
            + "<if test='reqVO.offerId != null'> AND d.offer_id = #{reqVO.offerId}</if>"
            + "<if test='reqVO.featured != null'> AND d.featured = #{reqVO.featured}</if>"
            + "<if test='reqVO.title != null and reqVO.title != \"\"'> AND d.title LIKE CONCAT('%', #{reqVO.title}, '%')</if>"
            + "<if test='reqVO.regions != null and reqVO.regions.size() > 0'> AND ("
            + "<foreach collection='reqVO.regions' item='region' separator=' OR '>FIND_IN_SET(#{region}, d.regions) > 0</foreach>"
            + ")</if>";

    default PageResult<DealDO> selectPage(DealPageReqVO reqVO) {
        // 无分类筛选：不涉及关联表，走普通分页（索引完备）
        if (reqVO.getCategoryId() == null) {
            LambdaQueryWrapperX<DealDO> qry = new LambdaQueryWrapperX<DealDO>()
                    .eqIfPresent(DealDO::getMerchantId, reqVO.getMerchantId())
                    .eqIfPresent(DealDO::getOfferId, reqVO.getOfferId())
                    .likeIfPresent(DealDO::getTitle, reqVO.getTitle())
                    .eqIfPresent(DealDO::getFeatured, reqVO.getFeatured())
                    .eqIfPresent(DealDO::getStatus, reqVO.getStatus())
                    .orderByDesc(DealDO::getId);
            if (CollUtil.isNotEmpty(reqVO.getRegions())) {
                // 参数化占位符绑定 regions，App 端该参数对外公开，禁止字符串拼接
                List<String> regions = reqVO.getRegions();
                String[] conditions = new String[regions.size()];
                for (int i = 0; i < regions.size(); i++) {
                    conditions[i] = "FIND_IN_SET({" + i + "}, regions) > 0";
                }
                qry.apply("(" + String.join(" OR ", conditions) + ")", regions.toArray());
            }
            return selectPage(reqVO, qry);
        }

        // 分类筛选：关联表数据量达百万行后，优化器对 EXISTS/IN 子查询的 semijoin
        // 计划不稳定（实测退化为关联表驱动 + deal 宽行全量回表 + filesort，单次 4s+）。
        // 改为显式 JOIN + 索引提示锁定确定性计划：
        //   count：dc 覆盖索引扫描 -> deal 窄覆盖索引 (id, tenant_id, status, deleted) 单行点查
        //   page ：内层 dc 覆盖索引按 deal_id 倒序流式扫描 + 窄索引过滤、满足 LIMIT 早停，
        //          外层仅对最终 page size 行回表取宽行（大小分类与深分页均稳定毫秒级）
        Long total = selectCountByCategory(reqVO);
        if (total == null || total == 0L) {
            return PageResult.empty();
        }
        List<DealDO> list = selectPageListByCategory(reqVO,
                (reqVO.getPageNo() - 1) * reqVO.getPageSize(), reqVO.getPageSize());
        return new PageResult<>(list, total);
    }

    @Select("<script>"
            + "SELECT COUNT(*) FROM river_coupon_deal_category dc "
            + "STRAIGHT_JOIN river_coupon_deal d USE INDEX (idx_deal_id_filters) ON dc.deal_id = d.id "
            + "WHERE 1 = 1" + CATEGORY_CONDITIONS
            + "</script>")
    Long selectCountByCategory(@Param("reqVO") DealPageReqVO reqVO);

    @Select("<script>"
            + "SELECT d.* FROM ("
            + "SELECT dc.deal_id FROM river_coupon_deal_category dc "
            + "STRAIGHT_JOIN river_coupon_deal d USE INDEX (idx_deal_id_filters) ON d.id = dc.deal_id "
            + "WHERE 1 = 1" + CATEGORY_CONDITIONS
            + " ORDER BY dc.deal_id DESC LIMIT #{offset}, #{size}"
            + ") page JOIN river_coupon_deal d ON d.id = page.deal_id "
            + "ORDER BY d.id DESC"
            + "</script>")
    List<DealDO> selectPageListByCategory(@Param("reqVO") DealPageReqVO reqVO,
                                           @Param("offset") Integer offset,
                                           @Param("size") Integer size);

    default DealDO selectBySlug(String slug) {
        return selectOne(DealDO::getSlug, slug);
    }

    default Long selectCountByMerchantId(Long merchantId) {
        return selectCount(new LambdaQueryWrapperX<DealDO>()
                .eq(DealDO::getMerchantId, merchantId)
                .eq(DealDO::getStatus, CommonStatusEnum.ENABLE.getStatus()));
    }

    /**
     * sitemap 轻量分页：只取 id/slug/update_time 三列，避免 description 等
     * LONGTEXT 字段随分片全量传输（80 万行下全字段查询会拖垮 JVM 与网络）。
     * 主键升序保证分片边界稳定。
     */
    default PageResult<DealDO> selectSitemapPage(PageParam pageParam) {
        return selectPage(pageParam, new LambdaQueryWrapperX<DealDO>()
                .select(DealDO::getId, DealDO::getSlug, DealDO::getUpdateTime)
                .eq(DealDO::getStatus, CommonStatusEnum.ENABLE.getStatus())
                .orderByAsc(DealDO::getId));
    }

    /**
     * 根据联盟网络ID和外部ID查询 Deal
     * 用于同步时判重
     */
    default DealDO selectByNetworkAndExternalId(Long networkId, String externalId) {
        return selectOne(new LambdaQueryWrapperX<DealDO>()
                .eq(DealDO::getNetworkId, networkId)
                .eq(DealDO::getExternalId, externalId));
    }

    /**
     * 批量查询联盟网络下的 Deals（按 externalId 列表）
     * 用于同步时预加载已存在数据，实现幂等写入
     *
     * @param networkId   联盟网络 ID
     * @param externalIds 外部 ID 列表
     * @return Deal 列表
     */
    default List<DealDO> selectListByNetworkAndExternalIds(Long networkId, List<String> externalIds) {
        if (externalIds == null || externalIds.isEmpty()) {
            return List.of();
        }
        return selectList(new LambdaQueryWrapperX<DealDO>()
                .eq(DealDO::getNetworkId, networkId)
                .in(DealDO::getExternalId, externalIds));
    }

}

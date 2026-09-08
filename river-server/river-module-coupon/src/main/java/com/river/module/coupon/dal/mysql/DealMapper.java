package com.river.module.coupon.dal.mysql;

import cn.hutool.core.collection.CollUtil;
import com.river.framework.common.pojo.PageResult;
import com.river.framework.mybatis.core.mapper.BaseMapperX;
import com.river.framework.mybatis.core.query.LambdaQueryWrapperX;
import com.river.module.coupon.controller.admin.deal.vo.DealPageReqVO;
import com.river.module.coupon.dal.dataobject.DealDO;
import org.apache.ibatis.annotations.Mapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Mapper
public interface DealMapper extends BaseMapperX<DealDO> {

    default PageResult<DealDO> selectPage(DealPageReqVO reqVO) {
        String regionSql = "";
        if (CollUtil.isNotEmpty(reqVO.getRegions())) {
            // MySQL 使用 FIND_IN_SET 判断 regions 是否包含指定 region
            regionSql = "(" + reqVO.getRegions().stream()
                    .map(region -> "FIND_IN_SET('" + region + "', regions) > 0")
                    .collect(Collectors.joining(" OR ")) + ")";
        }
        LambdaQueryWrapperX<DealDO> qry = new LambdaQueryWrapperX<DealDO>()
                .eqIfPresent(DealDO::getMerchantId, reqVO.getMerchantId())
                .eqIfPresent(DealDO::getOfferId, reqVO.getOfferId())
                .likeIfPresent(DealDO::getTitle, reqVO.getTitle())
                .eqIfPresent(DealDO::getFeatured, reqVO.getFeatured())
                .eqIfPresent(DealDO::getStatus, reqVO.getStatus())
                .orderByDesc(DealDO::getId);
        if (!regionSql.isEmpty()) {
            qry.apply(regionSql);
        }
        // MySQL 使用 FIND_IN_SET 检查 category_ids 是否包含指定的 categoryId
        if (reqVO.getCategoryId() != null) {
            qry.apply("FIND_IN_SET({0}, category_ids) > 0",
                    String.valueOf(reqVO.getCategoryId()));
        }
        return selectPage(reqVO, qry);
    }

    default DealDO selectBySlug(String slug) {
        return selectOne(DealDO::getSlug, slug);
    }

    default Long selectCountByMerchantId(Long merchantId) {
        return selectCount(new LambdaQueryWrapperX<DealDO>()
                .eq(DealDO::getMerchantId, merchantId));
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

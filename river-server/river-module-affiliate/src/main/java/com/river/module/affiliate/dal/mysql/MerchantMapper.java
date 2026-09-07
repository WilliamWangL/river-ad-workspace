package com.river.module.affiliate.dal.mysql;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.river.framework.common.pojo.PageResult;
import com.river.framework.common.util.string.StrUtils;
import com.river.framework.mybatis.core.mapper.BaseMapperX;
import com.river.framework.mybatis.core.query.LambdaQueryWrapperX;
import com.river.module.affiliate.controller.admin.merchant.vo.MerchantPageReqVO;
import com.river.module.affiliate.dal.dataobject.MerchantDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.stream.Collectors;

@Mapper
public interface MerchantMapper extends BaseMapperX<MerchantDO> {

    default PageResult<MerchantDO> selectPage(MerchantPageReqVO reqVO) {
        String regionSql = "";
        if (CollUtil.isNotEmpty(reqVO.getRegions())) {
            // MySQL 使用 FIND_IN_SET 判断 regions 是否包含指定 region
            regionSql = "(" + reqVO.getRegions().stream()
                    .map(region -> "FIND_IN_SET('" + region + "', regions) > 0")
                    .collect(Collectors.joining(" OR ")) + ")";
        }
        LambdaQueryWrapperX<MerchantDO> qry= new LambdaQueryWrapperX<MerchantDO>();
        qry.eqIfPresent(MerchantDO::getNetworkId, reqVO.getNetworkId())
                .likeIfPresent(MerchantDO::getName, reqVO.getName())
                .likeIfPresent(MerchantDO::getDomain, reqVO.getDomain())
                .eqIfPresent(MerchantDO::getStatus, reqVO.getStatus())
                .orderByDesc(MerchantDO::getId);
        if(!regionSql.isEmpty()){
            qry.apply(regionSql);
        }
        return selectPage(reqVO,qry);
    }

    default MerchantDO selectBySlug(String slug) {
        return selectOne(MerchantDO::getSlug, slug);
    }

    default MerchantDO selectByNetworkAndExternalId(Long networkId, String externalId) {
        return selectOne(new LambdaQueryWrapperX<MerchantDO>()
                .eq(MerchantDO::getNetworkId, networkId)
                .eq(MerchantDO::getExternalId, externalId));
    }

    /**
     * 批量查询联盟网络下的商家（按 externalId 列表）
     * 用于同步时预加载已存在数据，实现幂等写入
     *
     * @param networkId   联盟网络 ID
     * @param externalIds 外部 ID 列表
     * @return 商家列表
     */
    default List<MerchantDO> selectListByNetworkAndExternalIds(Long networkId, List<String> externalIds) {
        if (externalIds == null || externalIds.isEmpty()) {
            return List.of();
        }
        return selectList(new LambdaQueryWrapperX<MerchantDO>()
                .eq(MerchantDO::getNetworkId, networkId)
                .in(MerchantDO::getExternalId, externalIds));
    }

}

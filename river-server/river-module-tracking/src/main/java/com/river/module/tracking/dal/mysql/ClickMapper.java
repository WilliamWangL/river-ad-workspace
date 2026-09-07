package com.river.module.tracking.dal.mysql;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.river.framework.common.pojo.PageResult;
import com.river.framework.mybatis.core.mapper.BaseMapperX;
import com.river.framework.mybatis.core.query.LambdaQueryWrapperX;
import com.river.module.tracking.controller.admin.click.vo.ClickPageReqVO;
import com.river.module.tracking.dal.dataobject.ClickDO;
import cn.hutool.core.collection.CollUtil;
import org.apache.ibatis.annotations.Mapper;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Mapper
public interface ClickMapper extends BaseMapperX<ClickDO> {

    default PageResult<ClickDO> selectPage(ClickPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<ClickDO>()
                .eqIfPresent(ClickDO::getTargetType, reqVO.getTargetType())
                .eqIfPresent(ClickDO::getTargetId, reqVO.getTargetId())
                .eqIfPresent(ClickDO::getMerchantId, reqVO.getMerchantId())
                .eqIfPresent(ClickDO::getCouponId, reqVO.getCouponId())
                .eqIfPresent(ClickDO::getDealId, reqVO.getDealId())
                .eqIfPresent(ClickDO::getCampaignId, reqVO.getCampaignId())
                .likeIfPresent(ClickDO::getSub1, reqVO.getSub1())
                .likeIfPresent(ClickDO::getIp, reqVO.getIp())
                .eqIfPresent(ClickDO::getCountry, reqVO.getCountry())
                .betweenIfPresent(ClickDO::getClickTime, reqVO.getClickTime())
                .orderByDesc(ClickDO::getClickTime));
    }

    default ClickDO selectByClickId(String clickId) {
        return selectOne(ClickDO::getClickId, clickId);
    }

    /**
     * 按指定维度列聚合点击数
     */
    default List<Map<String, Object>> selectClicksGroupByDimension(LocalDate date, String dimensionColumn) {
        QueryWrapper<ClickDO> wrapper = new QueryWrapper<>();
        wrapper.select(dimensionColumn + " as dimensionId", "COUNT(*) as clicks")
                .apply("DATE(click_time) = {0}", date)
                .isNotNull(dimensionColumn)
                .groupBy(dimensionColumn);
        return selectMaps(wrapper);
    }

    default List<Map<String, Object>> selectClicksGroupByCampaign(LocalDate date) {
        return selectClicksGroupByDimension(date, "campaign_id");
    }

    default List<Map<String, Object>> selectClicksGroupByTarget(LocalDate date, Integer targetType) {
        QueryWrapper<ClickDO> wrapper = new QueryWrapper<>();
        wrapper.select("target_id as targetId", "COUNT(*) as clicks")
                .apply("DATE(click_time) = {0}", date)
                .eq("target_type", targetType)
                .isNotNull("target_id")
                .groupBy("target_id");
        return selectMaps(wrapper);
    }

    default List<Map<String, Object>> selectClicksGroupByOffer(LocalDate date) {
        return selectClicksGroupByTarget(date, 2); // target_type=2 为 Offer
    }

    default List<Map<String, Object>> selectClicksGroupByLandingPage(LocalDate date) {
        return selectClicksGroupByDimension(date, "landing_page_id");
    }

    /**
     * 根据 clickIds 批量查询 Click 记录
     */
    default List<ClickDO> selectByClickIds(Collection<String> clickIds) {
        if (CollUtil.isEmpty(clickIds)) {
            return Collections.emptyList();
        }
        return selectList(new LambdaQueryWrapperX<ClickDO>()
                .in(ClickDO::getClickId, clickIds));
    }

}

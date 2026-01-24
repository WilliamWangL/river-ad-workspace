package com.river.module.tracking.dal.mysql;

import com.river.framework.common.enums.CommonStatusEnum;
import com.river.framework.common.pojo.PageResult;
import com.river.framework.mybatis.core.mapper.BaseMapperX;
import com.river.framework.mybatis.core.query.LambdaQueryWrapperX;
import com.river.module.tracking.controller.admin.trackinglink.vo.TrackingLinkPageReqVO;
import com.river.module.tracking.dal.dataobject.TrackingLinkDO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TrackingLinkMapper extends BaseMapperX<TrackingLinkDO> {

    default TrackingLinkDO selectBySlug(String slug) {
        return selectOne(new LambdaQueryWrapperX<TrackingLinkDO>()
                .eq(TrackingLinkDO::getSlug, slug)
                .eq(TrackingLinkDO::getStatus, CommonStatusEnum.ENABLE.getStatus()));
    }

    // 不检查状态，用于追踪重定向
    default TrackingLinkDO selectBySlugAnyStatus(String slug) {
        return selectOne(new LambdaQueryWrapperX<TrackingLinkDO>()
                .eq(TrackingLinkDO::getSlug, slug));
    }

    default TrackingLinkDO selectByTarget(Integer targetType, Long targetId) {
        return selectOne(new LambdaQueryWrapperX<TrackingLinkDO>()
                .eq(TrackingLinkDO::getTargetType, targetType)
                .eq(TrackingLinkDO::getTargetId, targetId)
                .eq(TrackingLinkDO::getStatus, CommonStatusEnum.ENABLE.getStatus()));
    }

    default PageResult<TrackingLinkDO> selectPage(TrackingLinkPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<TrackingLinkDO>()
                .eqIfPresent(TrackingLinkDO::getTargetType, reqVO.getTargetType())
                .eqIfPresent(TrackingLinkDO::getTargetId, reqVO.getTargetId())
                .likeIfPresent(TrackingLinkDO::getSlug, reqVO.getSlug())
                .eqIfPresent(TrackingLinkDO::getStatus, reqVO.getStatus())
                .orderByDesc(TrackingLinkDO::getId));
    }

}

package com.river.module.tracking.api.trackinglink;

import com.river.framework.common.biz.tracking.TrackingLinkCommonApi;
import com.river.framework.common.biz.tracking.dto.TrackingLinkCreateReqDTO;
import com.river.framework.common.biz.tracking.dto.TrackingLinkRespDTO;
import com.river.framework.common.enums.CommonStatusEnum;
import com.river.framework.common.util.object.BeanUtils;
import com.river.module.tracking.dal.dataobject.TrackingLinkDO;
import com.river.module.tracking.dal.mysql.TrackingLinkMapper;
import com.river.module.tracking.service.TrackingLinkService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 追踪链接 API 实现类
 * 用于跨模块调用，避免循环依赖
 */
@Service
public class TrackingLinkApiImpl implements TrackingLinkCommonApi {

    @Resource
    private TrackingLinkService trackingLinkService;

    @Resource
    private TrackingLinkMapper trackingLinkMapper;

    @Override
    public TrackingLinkRespDTO createOrUpdateTrackingLink(TrackingLinkCreateReqDTO reqDTO) {
        // 查找现有链接
        TrackingLinkDO existingLink = trackingLinkMapper.selectByTarget(reqDTO.getTargetType(), reqDTO.getTargetId());

        if (existingLink != null) {
            // 更新现有链接
            existingLink.setSlug(reqDTO.getSlug());
            existingLink.setTrackingUrl(reqDTO.getTrackingUrl());
            existingLink.setMerchantId(reqDTO.getMerchantId());
            existingLink.setStatus(CommonStatusEnum.ENABLE.getStatus());
            trackingLinkService.updateTrackingLink(existingLink);
            return BeanUtils.toBean(existingLink, TrackingLinkRespDTO.class);
        } else {
            // 创建新链接
            TrackingLinkDO newLink = BeanUtils.toBean(reqDTO, TrackingLinkDO.class);
            newLink.setStatus(CommonStatusEnum.ENABLE.getStatus());
            Long id = trackingLinkService.createTrackingLink(newLink);
            newLink.setId(id);
            return BeanUtils.toBean(newLink, TrackingLinkRespDTO.class);
        }
    }

    @Override
    public TrackingLinkRespDTO getTrackingLink(Integer targetType, Long targetId) {
        TrackingLinkDO link = trackingLinkMapper.selectByTarget(targetType, targetId);
        if (link == null) {
            return null;
        }
        return BeanUtils.toBean(link, TrackingLinkRespDTO.class);
    }

    @Override
    public Map<Long, TrackingLinkRespDTO> getTrackingLinks(Integer targetType, List<Long> targetIds) {
        if (targetIds == null || targetIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<TrackingLinkDO> links = trackingLinkMapper.selectByTargets(targetType, targetIds);
        return links.stream().collect(Collectors.toMap(
                TrackingLinkDO::getTargetId,
                link -> BeanUtils.toBean(link, TrackingLinkRespDTO.class),
                (existing, replacement) -> existing // 如果有重复，保留第一个
        ));
    }

}

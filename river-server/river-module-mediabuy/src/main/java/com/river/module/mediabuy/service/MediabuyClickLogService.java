package com.river.module.mediabuy.service;

import com.river.module.affiliate.dal.dataobject.OfferDO;
import jakarta.servlet.http.HttpServletRequest;

/**
 * 媒体投放点击日志
 */
public interface MediabuyClickLogService {

    /**
     * 记录点击并落库，返回宏替换后的最终跳转链接（用于 JS 跳转）。
     */
    String recordClick(OfferDO offer, String publisherClickId, String subid1, String subid2, HttpServletRequest request);

}


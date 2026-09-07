package com.river.module.mediabuy.service;

import jakarta.servlet.http.HttpServletRequest;

/**
 * JS 200 跳转服务
 */
public interface MediabuyJumpService {

    /**
     * 返回 HTTP 200 的 JS 响应内容，前端执行后跳转到 offer.gotoUrl
     */
    String buildJs200(Long offerId, String publisherClickId, String subid1, String subid2, HttpServletRequest request);

}


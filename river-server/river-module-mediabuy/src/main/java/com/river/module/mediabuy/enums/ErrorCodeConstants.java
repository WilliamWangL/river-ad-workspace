package com.river.module.mediabuy.enums;

import com.river.framework.common.exception.ErrorCode;

/**
 * Mediabuy 错误码
 *
 * 错误码范围：1-016-000-000 ~ 1-016-999-999
 */
public interface ErrorCodeConstants {

    ErrorCode OFFER_NOT_EXISTS = new ErrorCode(1_016_000_001, "Offer 不存在");
    ErrorCode OFFER_GOTO_URL_EMPTY = new ErrorCode(1_016_000_002, "Offer 跳转链接为空");

}


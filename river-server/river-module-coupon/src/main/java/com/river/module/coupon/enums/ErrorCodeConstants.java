package com.river.module.coupon.enums;

import com.river.framework.common.exception.ErrorCode;

/**
 * Coupon 错误码枚举类
 *
 * coupon 模块，使用 1-022-000-000 段
 */
public interface ErrorCodeConstants {

    // ========== 优惠券 1-022-000-000 ==========
    ErrorCode COUPON_NOT_EXISTS = new ErrorCode(1_022_000_001, "优惠券不存在");
    ErrorCode COUPON_CODE_DUPLICATE = new ErrorCode(1_022_000_002, "优惠码已存在");
    ErrorCode COUPON_EXPIRED = new ErrorCode(1_022_000_003, "优惠券已过期");

    // ========== Deal 1-022-001-000 ==========
    ErrorCode DEAL_NOT_EXISTS = new ErrorCode(1_022_001_001, "Deal 不存在");
    ErrorCode DEAL_EXPIRED = new ErrorCode(1_022_001_002, "Deal 已过期");
    ErrorCode DEAL_SLUG_DUPLICATE = new ErrorCode(1_022_001_003, "Deal Slug 已存在");
    ErrorCode DEAL_NETWORK_EXTERNAL_DUPLICATE = new ErrorCode(1_022_001_004, "Deal 联盟网络外部 ID 已存在");

}

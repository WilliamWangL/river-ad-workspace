package com.river.framework.common.biz.tracking;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 追踪目标类型枚举
 */
@Getter
@AllArgsConstructor
public enum TrackingTargetTypeEnum {

    MERCHANT(1, "商家"),
    OFFER(2, "Offer"),
    DEAL(3, "Deal"),
    COUPON(4, "优惠券");

    private final Integer type;
    private final String name;

    public static TrackingTargetTypeEnum valueOf(Integer type) {
        for (TrackingTargetTypeEnum value : values()) {
            if (value.getType().equals(type)) {
                return value;
            }
        }
        return null;
    }
}

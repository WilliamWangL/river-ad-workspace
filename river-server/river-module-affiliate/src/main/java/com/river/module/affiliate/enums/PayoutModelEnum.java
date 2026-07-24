package com.river.module.affiliate.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 计费模型枚举（对应字典 affiliate_commission_type）
 * CPS: Cost Per Sale - 按销售付费
 * CPA: Cost Per Action - 按行动付费
 * CPC: Cost Per Click - 按点击付费
 * CPL: Cost Per Lead - 按潜在客户付费
 * CPM: Cost Per Mille - 按千次展示付费
 */
@Getter
@AllArgsConstructor
public enum PayoutModelEnum {

    CPS(1, "CPS (按销售)"),
    CPA(2, "CPA (按行动)"),
    CPC(3, "CPC (按点击)"),
    CPL(4, "CPL (按潜在客户)"),
    CPM(5, "CPM (按千次展示)");

    private final Integer code;
    private final String name;

    public static PayoutModelEnum getByCode(Integer code) {
        if (code == null) return CPS;
        for (PayoutModelEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value;
            }
        }
        return CPS;
    }

    /**
     * 从 Admitad API 类型字符串映射
     */
    public static PayoutModelEnum fromAdmitadType(String type) {
        if (type == null) return CPS;
        return switch (type.toLowerCase()) {
            case "sale" -> CPS;
            case "lead" -> CPA;
            case "click" -> CPC;
            default -> CPS;
        };
    }

    /**
     * 从 Rakuten API 佣金类型映射
     */
    public static PayoutModelEnum fromRakutenType(String type) {
        if (type == null) return CPS;
        return switch (type.toLowerCase()) {
            case "sale", "per_sale" -> CPS;
            case "lead", "per_lead" -> CPA;
            case "click", "per_click" -> CPC;
            default -> CPS;
        };
    }
}

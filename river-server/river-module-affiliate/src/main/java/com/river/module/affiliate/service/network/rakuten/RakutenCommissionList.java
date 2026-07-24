package com.river.module.affiliate.service.network.rakuten;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Rakuten Advertising 佣金列表 API 响应模型
 * 对应 API: GET /v1/commissioning_lists
 */
@Data
public class RakutenCommissionList {

    /** 佣金列表 ID */
    private Long id;

    /** 关联的广告商 ID */
    @JsonProperty("advertiser_id")
    private Long advertiserId;

    /** 广告商名称 */
    @JsonProperty("advertiser_name")
    private String advertiserName;

    /** 佣金类型: sale, lead, click 等 */
    @JsonProperty("commission_type")
    private String commissionType;

    /** 佣金率（百分比或固定金额） */
    @JsonProperty("commission_rate")
    private BigDecimal commissionRate;

    /** 佣金货币 */
    private String currency;

    /** Cookie 有效期（天） */
    @JsonProperty("cookie_duration")
    private Integer cookieDuration;

    /** Offer 名称 */
    @JsonProperty("offer_name")
    private String offerName;

    /** 状态: active, inactive */
    private String status;

    /** 支持的国家/地区列表 */
    private List<String> countries;

    /** 分类列表 */
    private List<Category> categories;

    /** 跳转 URL */
    @JsonProperty("click_url")
    private String clickUrl;

    /** 落地页 URL */
    @JsonProperty("landing_url")
    private String landingUrl;

    @Data
    public static class Category {
        private Long id;
        private String name;
    }
}

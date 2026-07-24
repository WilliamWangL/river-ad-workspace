package com.river.module.affiliate.service.network.rakuten;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Rakuten Advertising 广告商 API 响应模型
 * 对应 API: GET /v2/advertisers
 */
@Data
public class RakutenAdvertiser {

    /** 广告商 ID */
    private Long id;

    /** 广告商名称 */
    private String name;

    /** 广告商网站 URL */
    private String url;

    /** Logo URL */
    @JsonProperty("logo_url")
    private String logoUrl;

    /** 广告商描述 */
    private String description;

    /** 广告商状态 */
    private String status;

    /** 是否支持深链接 */
    @JsonProperty("deep_links")
    private Boolean deepLinks;

    /** 支持的国家/地区列表 */
    private List<String> countries;

    /** 分类列表 */
    private List<Category> categories;

    /** 评分 */
    private Double rating;

    /** 广告商域名 */
    private String domain;

    @Data
    public static class Category {
        private Long id;
        private String name;
    }
}

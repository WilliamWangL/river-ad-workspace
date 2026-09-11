package com.river.framework.common.biz.affiliate.dto;

import lombok.Data;

import java.util.List;

/**
 * 商家简单信息 DTO
 */
@Data
public class MerchantSimpleRespDTO {

    /**
     * 商家编号
     */
    private Long id;

    /**
     * 商家名称
     */
    private String name;

    /**
     * 商家 Logo URL
     */
    private String logoUrl;

    /**
     * 商家 Slug
     */
    private String slug;

    /**
     * 商家域名
     */
    private String domain;

    /**
     * 支持的地区（ISO 代码列表）
     */
    private List<String> regions;

    /**
     * 货币代码（ISO 4217，如 USD、EUR、GBP、CNY、RUB）
     */
    private String currency;

}

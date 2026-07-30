package com.river.module.affiliate.controller.admin.merchant.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "管理后台 - 商家 Response VO")
@Data
public class MerchantRespVO {

    @Schema(description = "编号", example = "1")
    private Long id;

    @Schema(description = "关联的联盟网络 ID", example = "1")
    private Long networkId;

    @Schema(description = "联盟侧商家 ID", example = "12345")
    private String externalId;

    @Schema(description = "商家名称", example = "Amazon")
    private String name;

    @Schema(description = "商家域名", example = "amazon.com")
    private String domain;

    @Schema(description = "Logo URL")
    private String logoUrl;

    @Schema(description = "商家描述（联盟同步原始描述，回退值）")
    private String description;

    @Schema(description = "商家简介（短文本，为空回退 description）")
    private String intro;

    @Schema(description = "商家描述（长富文本，为空回退 description）")
    private String about;

    @Schema(description = "商家评级（1-5）", example = "4.5")
    private BigDecimal rating;

    @Schema(description = "状态", example = "1")
    private Integer status;

    @Schema(description = "支持的国家/地区（ISO 代码列表）")
    private List<String> regions;

    @Schema(description = "分类 ID 列表（JSON 数组）")
    private String categoryIds;

    @Schema(description = "默认 Offer ID，用于 Visit Store 追踪", example = "1")
    private Long defaultOfferId;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}

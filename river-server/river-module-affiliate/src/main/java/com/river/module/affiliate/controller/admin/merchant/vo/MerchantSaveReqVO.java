package com.river.module.affiliate.controller.admin.merchant.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "管理后台 - 商家创建/修改 Request VO")
@Data
public class MerchantSaveReqVO {

    @Schema(description = "编号", example = "1")
    private Long id;

    @Schema(description = "关联的联盟网络 ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "联盟网络不能为空")
    private Long networkId;

    @Schema(description = "联盟侧商家 ID", example = "12345")
    private String externalId;

    @Schema(description = "商家名称", requiredMode = Schema.RequiredMode.REQUIRED, example = "Amazon")
    @NotBlank(message = "商家名称不能为空")
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

    @Schema(description = "状态", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "状态不能为空")
    private Integer status;

    @Schema(description = "支持的国家/地区（ISO 代码列表）", example = "[\"US\", \"UK\"]")
    private List<String> regions;

    @Schema(description = "分类 ID 列表（JSON 数组）", example = "[1, 2, 3]")
    private String categoryIds;

    @Schema(description = "默认 Offer ID，用于 Visit Store 追踪", example = "1")
    private Long defaultOfferId;
}

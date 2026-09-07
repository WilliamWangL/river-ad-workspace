package com.river.module.affiliate.controller.admin.category.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Schema(description = "管理后台 - 分类创建/修改 Request VO")
@Data
public class CategorySaveReqVO {

    @Schema(description = "编号", example = "1")
    private Long id;

    @Schema(description = "父分类 ID，0 表示顶级", requiredMode = Schema.RequiredMode.REQUIRED, example = "0")
    @NotNull(message = "父分类不能为空")
    private Long parentId;

    @Schema(description = "分类名称", requiredMode = Schema.RequiredMode.REQUIRED, example = "电子产品")
    @NotBlank(message = "分类名称不能为空")
    private String name;

    @Schema(description = "URL Slug", example = "electronics")
    private String slug;

    @Schema(description = "层级", example = "1")
    private Integer level;

    @Schema(description = "排序", example = "0")
    private Integer sort;

    @Schema(description = "图标")
    private String icon;

    @Schema(description = "地区代码，如 US、RU、00 表示默认")
    private String region;

    @Schema(description = "状态", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "状态不能为空")
    private Integer status;
}

package com.river.module.affiliate.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@Schema(description = "用户 App - 分类 Response VO")
public class AppCategoryRespVO {

    @Schema(description = "分类编号", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    private Long id;

    @Schema(description = "分类名称", requiredMode = Schema.RequiredMode.REQUIRED, example = "Electronics")
    private String name;

    @Schema(description = "分类标识", requiredMode = Schema.RequiredMode.REQUIRED, example = "electronics")
    private String slug;

    @Schema(description = "分类图标", example = "laptop")
    private String icon;

    @Schema(description = "层级", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    private Integer level;

    @Schema(description = "父分类编号", example = "0")
    private Long parentId;

    @Schema(description = "地区代码", example = "US")
    private String region;

    @Schema(description = "子分类列表")
    private List<AppCategoryRespVO> children;

}

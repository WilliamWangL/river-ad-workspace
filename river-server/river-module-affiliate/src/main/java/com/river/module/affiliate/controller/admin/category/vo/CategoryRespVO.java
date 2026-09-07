package com.river.module.affiliate.controller.admin.category.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 分类 Response VO")
@Data
public class CategoryRespVO {

    @Schema(description = "编号", example = "1")
    private Long id;

    @Schema(description = "父分类 ID", example = "0")
    private Long parentId;

    @Schema(description = "分类名称", example = "电子产品")
    private String name;

    @Schema(description = "URL Slug", example = "electronics")
    private String slug;

    @Schema(description = "层级", example = "1")
    private Integer level;

    @Schema(description = "排序", example = "0")
    private Integer sort;

    @Schema(description = "图标")
    private String icon;

    @Schema(description = "地区代码")
    private String region;

    @Schema(description = "状态", example = "1")
    private Integer status;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}

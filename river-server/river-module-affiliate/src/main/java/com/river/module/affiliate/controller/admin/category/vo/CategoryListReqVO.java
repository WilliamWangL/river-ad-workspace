package com.river.module.affiliate.controller.admin.category.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(description = "管理后台 - 分类列表 Request VO")
@Data
public class CategoryListReqVO {

    @Schema(description = "分类名称")
    private String name;

    @Schema(description = "状态")
    private Integer status;

    @Schema(description = "父分类 ID")
    private Long parentId;

    @Schema(description = "地区代码")
    private String region;
}

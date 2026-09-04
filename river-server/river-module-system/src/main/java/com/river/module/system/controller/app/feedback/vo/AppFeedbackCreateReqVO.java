package com.river.module.system.controller.app.feedback.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Schema(description = "用户 App - 创建反馈 Request VO")
@Data
public class AppFeedbackCreateReqVO {

    @Schema(description = "反馈来源类型：deal / blog / offer / general", example = "deal")
    @Size(max = 32, message = "来源类型长度不能超过 32 个字符")
    private String sourceType;

    @Schema(description = "来源页面标识（如 slug 或 URL）", example = "nike-air-max-50-off")
    @Size(max = 256, message = "来源页面标识长度不能超过 256 个字符")
    private String sourcePage;

    @Schema(description = "提交人姓名", requiredMode = Schema.RequiredMode.REQUIRED, example = "张三")
    @NotBlank(message = "姓名不能为空")
    @Size(max = 64, message = "姓名长度不能超过 64 个字符")
    private String name;

    @Schema(description = "邮箱", example = "user@example.com")
    @Size(max = 128, message = "邮箱长度不能超过 128 个字符")
    private String email;

    @Schema(description = "反馈内容", requiredMode = Schema.RequiredMode.REQUIRED, example = "建议增加XX功能")
    @NotBlank(message = "反馈内容不能为空")
    @Size(max = 2000, message = "反馈内容长度不能超过 2000 个字符")
    private String message;
}

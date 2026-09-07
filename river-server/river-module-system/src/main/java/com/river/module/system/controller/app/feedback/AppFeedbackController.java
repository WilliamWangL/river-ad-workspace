package com.river.module.system.controller.app.feedback;

import com.river.framework.common.pojo.CommonResult;
import com.river.module.system.controller.app.feedback.vo.AppFeedbackCreateReqVO;
import com.river.module.system.dal.dataobject.feedback.FeedbackDO;
import com.river.module.system.dal.mysql.feedback.FeedbackMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import static com.river.framework.common.pojo.CommonResult.success;

@Tag(name = "用户 App - 意见反馈")
@RestController
@RequestMapping("/system/feedback")
@Validated
@PermitAll
public class AppFeedbackController {

    @Resource
    private FeedbackMapper feedbackMapper;

    @PostMapping("/create")
    @Operation(summary = "提交意见反馈")
    public CommonResult<Long> createFeedback(@Valid @RequestBody AppFeedbackCreateReqVO reqVO) {
        FeedbackDO feedback = FeedbackDO.builder()
                .sourceType(reqVO.getSourceType() != null ? reqVO.getSourceType() : "general")
                .sourcePage(reqVO.getSourcePage() != null ? reqVO.getSourcePage() : "")
                .name(reqVO.getName())
                .email(reqVO.getEmail() != null ? reqVO.getEmail() : "")
                .message(reqVO.getMessage())
                .status(0)
                .remark("")
                .build();
        feedbackMapper.insert(feedback);
        return success(feedback.getId());
    }
}

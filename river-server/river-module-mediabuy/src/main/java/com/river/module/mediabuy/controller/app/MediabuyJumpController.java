package com.river.module.mediabuy.controller.app;

import com.river.framework.tenant.core.aop.TenantIgnore;
import com.river.module.mediabuy.service.MediabuyJumpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.annotation.security.PermitAll;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "公开 API - 媒体投放跳转")
@RestController
@RequestMapping("/track")
@Validated
public class MediabuyJumpController {

    @Resource
    private MediabuyJumpService jumpService;

    @GetMapping(value = "/{offerId}", produces = "text/html;charset=UTF-8")
    @Operation(summary = "JS 200 跳转", description = "路径格式：/track/{offerId}?pid={pid}&subid1={subid1}&subid2={subid2}")
    @Parameters({
            @Parameter(name = "offerId", description = "Offer ID", required = true),
            @Parameter(name = "pid", description = "媒体侧点击 ID（外部传入）"),
            @Parameter(name = "subid1", description = "Sub ID 1"),
            @Parameter(name = "subid2", description = "Sub ID 2")
    })
    @PermitAll
    @TenantIgnore
    public ResponseEntity<String> track(@PathVariable("offerId") Long offerId,
                                        @RequestParam(value = "pid", required = false) String publisherClickId,
                                        @RequestParam(value = "subid1", required = false) String subid1,
                                        @RequestParam(value = "subid2", required = false) String subid2,
                                        HttpServletRequest request) {
        String html = jumpService.buildJs200(offerId, publisherClickId, subid1, subid2, request);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("text/html;charset=UTF-8"))
                .body(html);
    }

}


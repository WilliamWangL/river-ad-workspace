package com.river.module.tracking.controller.app;

import com.river.module.tracking.service.ClickService;
import com.river.framework.tenant.core.context.TenantContextHolder;
import com.river.framework.web.core.util.WebFrameworkUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.annotation.security.PermitAll;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@Tag(name = "公开 API - 追踪重定向")
@RestController
@RequestMapping("/api/go")
@Validated
@Slf4j
public class TrackingRedirectController {

    @Resource
    private ClickService clickService;

    @GetMapping("/{id}")
    @Operation(summary = "追踪重定向", description = "记录点击并重定向到联盟链接")
    @Parameters({
            @Parameter(name = "id", description = "追踪链接 ID 或 Slug", required = true),
            @Parameter(name = "sub1", description = "Sub ID 1"),
            @Parameter(name = "sub2", description = "Sub ID 2"),
            @Parameter(name = "sub3", description = "Sub ID 3"),
            @Parameter(name = "sub4", description = "Sub ID 4"),
            @Parameter(name = "sub5", description = "Sub ID 5")
    })
    @PermitAll
    public RedirectView redirect(
            @PathVariable("id") String id,
            @RequestParam(value = "sub1", required = false) String sub1,
            @RequestParam(value = "sub2", required = false) String sub2,
            @RequestParam(value = "sub3", required = false) String sub3,
            @RequestParam(value = "sub4", required = false) String sub4,
            @RequestParam(value = "sub5", required = false) String sub5,
            HttpServletRequest request) {

        // 初始化租户上下文（解决多租户隔离问题）
        initTenantContext(request);

        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String referer = request.getHeader("Referer");

        String redirectUrl = clickService.recordClickAndGetRedirectUrl(
                id, sub1, sub2, sub3, sub4, sub5, ip, userAgent, referer);

        RedirectView redirectView = new RedirectView(redirectUrl);
        redirectView.setStatusCode(HttpStatus.FOUND);
        return redirectView;
    }

    /**
     * 初始化租户上下文，从请求头中读取 tenant-id
     */
    private void initTenantContext(HttpServletRequest request) {
        Long tenantId = WebFrameworkUtils.getTenantId(request);
        if (tenantId != null) {
            TenantContextHolder.setTenantId(tenantId);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

}

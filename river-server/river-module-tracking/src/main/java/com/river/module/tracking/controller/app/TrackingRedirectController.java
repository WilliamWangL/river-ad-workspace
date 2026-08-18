package com.river.module.tracking.controller.app;

import com.river.framework.common.util.http.JsRedirectUtil;
import com.river.framework.tenant.core.aop.TenantIgnore;
import com.river.module.tracking.service.ClickService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.annotation.security.PermitAll;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "公开 API - 追踪重定向")
@RestController
@RequestMapping("/api/go")
@Validated
@Slf4j
public class TrackingRedirectController {

    private static final Map<String, Integer> TYPE_MAP = Map.of(
            "merchant", 1,
            "offer", 2,
            "deal", 3,
            "coupon", 4
    );

    @Resource
    private ClickService clickService;

    @GetMapping("/{type}/{id}")
    @Operation(summary = "追踪重定向", description = "记录点击并通过 JS 200 跳转到联盟链接")
    @Parameters({
            @Parameter(name = "type", description = "目标类型: merchant/offer/deal/coupon", required = true),
            @Parameter(name = "id", description = "目标实体 ID", required = true),
            @Parameter(name = "sub1", description = "Sub ID 1"),
            @Parameter(name = "sub2", description = "Sub ID 2"),
            @Parameter(name = "sub3", description = "Sub ID 3"),
            @Parameter(name = "sub4", description = "Sub ID 4"),
            @Parameter(name = "sub5", description = "Sub ID 5")
    })
    @PermitAll
    @TenantIgnore
    public ResponseEntity<String> redirect(
            @PathVariable("type") String type,
            @PathVariable("id") Long id,
            @RequestParam(value = "sub1", required = false) String sub1,
            @RequestParam(value = "sub2", required = false) String sub2,
            @RequestParam(value = "sub3", required = false) String sub3,
            @RequestParam(value = "sub4", required = false) String sub4,
            @RequestParam(value = "sub5", required = false) String sub5,
            HttpServletRequest request) {

        Integer targetType = TYPE_MAP.get(type.toLowerCase());
        if (targetType == null) {
            log.warn("Invalid tracking type: {}", type);
            return ResponseEntity.ok()
                    .contentType(MediaType.valueOf("text/html;charset=UTF-8"))
                    .body(JsRedirectUtil.buildRedirectHtml("/"));
        }

        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String referer = request.getHeader("Referer");

        String redirectUrl = clickService.recordClickAndGetRedirectUrl(
                targetType, id, sub1, sub2, sub3, sub4, sub5, ip, userAgent, referer);

        // 返回 JS 200 跳转 HTML：搜索引擎爬虫/服务端 HTTP 客户端不执行 JS，无法跟踪到真实联盟链接
        String html = JsRedirectUtil.buildRedirectHtml(redirectUrl);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("text/html;charset=UTF-8"))
                .body(html);
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

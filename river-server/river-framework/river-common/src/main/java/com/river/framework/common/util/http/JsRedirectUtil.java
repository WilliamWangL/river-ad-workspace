package com.river.framework.common.util.http;

import com.river.framework.common.util.json.JsonUtils;

/**
 * JS 200 跳转工具类
 * <p>
 * 返回 HTTP 200 的 HTML 页面，通过 JavaScript window.location.replace() 实现客户端跳转。
 * 搜索引擎爬虫、服务端 HTTP 客户端等不执行 JS 的客户端无法跟踪到真实目标 URL，
 * 从而避免联盟链接被无效访问。
 * 同时附带 noscript meta refresh 兜底，覆盖禁用 JS 的浏览器。
 */
public class JsRedirectUtil {

    /**
     * 构建 JS 200 跳转 HTML 页面
     *
     * @param targetUrl 最终跳转目标 URL
     * @return 完整的 HTML 页面，包含 JS 跳转和 noscript 兜底
     */
    public static String buildRedirectHtml(String targetUrl) {
        if (targetUrl == null || targetUrl.isBlank()) {
            return buildRedirectHtml("about:blank");
        }
        // use JSON string as JS string literal (safe escaping)
        String urlLiteral = JsonUtils.toJsonString(targetUrl);
        return """
                <!DOCTYPE html>
                <html><head><meta charset="UTF-8">
                <title>Redirecting...</title>
                <noscript><meta http-equiv="refresh" content="0;url=%s"></noscript>
                </head><body>
                <script>
                (function () {
                  try {
                    var url = %s;
                    if (window && window.location) {
                      window.location.replace(url);
                    }
                  } catch (e) {
                    // ignore
                  }
                })();
                </script>
                </body></html>
                """.formatted(targetUrl.replace("\"", "&quot;"), urlLiteral);
    }

}

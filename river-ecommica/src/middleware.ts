import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en'
});
 
export const config = {
  // 匹配除 api、go、静态资源外的所有路径，确保无 locale 前缀的 URL（如 /categories）
  // 能被重定向到默认语言，而不是返回带 noindex 的 404 页（x-default hreflang 指向无前缀 URL）
  matcher: ['/((?!api|go|_next|_vercel|.*\\..*).*)']
};

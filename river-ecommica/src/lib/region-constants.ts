// Region constants - safe to import from both client and server components

export const REGION_COOKIE_NAME = 'region'
export const REGION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days
export const DEFAULT_REGION = 'GLOBAL'

// 后端使用的全球地区代码（数据库中存储为 '00'）
export const GLOBAL_REGION_CODE = 'GLOBAL'
export const GLOBAL_REGION_DB_CODE = '00'

/**
 * 检查是否为全球区域
 * 同时支持前端 'GLOBAL' 和后端 '00'
 */
export function isGlobalRegion(region: string | null | undefined): boolean {
  if (!region || region === '') return true
  const upperRegion = region.toUpperCase()
  return upperRegion === 'GLOBAL' || upperRegion === '00'
}

/**
 * 获取用于 API 请求的地区过滤参数
 * - 全球区域返回 undefined（后端回退到默认地区 '00'）
 * - 特定区域返回单个 region 字符串
 */
export function getRegionFilter(region: string | null | undefined): string | undefined {
  if (isGlobalRegion(region)) {
    return undefined
  }
  return region!.toUpperCase()
}

/**
 * 解析地区优先级
 * URL 参数 > Cookie > IP 定位 > 默认全球
 */
export function resolveRegion(
  urlParam: string | null | undefined,
  cookieValue: string | null | undefined,
  ipCountry: string | null | undefined
): string {
  if (urlParam && urlParam !== '') {
    return urlParam.toUpperCase()
  }
  if (cookieValue && cookieValue !== '') {
    return cookieValue.toUpperCase()
  }
  if (ipCountry && ipCountry !== '') {
    return ipCountry.toUpperCase()
  }
  return DEFAULT_REGION
}

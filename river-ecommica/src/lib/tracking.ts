import { ulid } from 'ulid'

export function generateClickId(): string {
  return ulid()
}

/**
 * 构建追踪重定向 URL
 * 格式: /go/{type}/{id}
 * 直接走 nginx 代理到后端，不经过 Next.js 代理层
 */
export function getTrackingUrl(type: string, id: number | undefined, fallbackUrl: string = '#'): string {
  if (id) {
    return `/go/${type}/${id}`
  }
  return fallbackUrl
}

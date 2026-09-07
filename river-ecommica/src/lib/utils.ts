import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将可能包含 HTML/Markdown 的富文本转为纯文本，
 * 用于 meta description、JSON-LD、卡片摘要等不渲染富文本的场景。
 */
export function stripHtml(html: string | null | undefined, maxLength?: number): string {
  if (!html) return ''
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<\/(p|div|h[1-6]|li|tr|br|hr|section|article|header|footer|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (maxLength && text.length > maxLength) {
    text = text.slice(0, maxLength - 1).trimEnd() + '…'
  }
  return text
}

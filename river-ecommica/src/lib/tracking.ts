import { ulid } from 'ulid'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:48080/app-api'
export function generateClickId(): string {
  return ulid()
}

export function getTrackingUrl(offerId: string): string {
  const apiBase = API_BASE_URL
  return `${apiBase}/api/go/${offerId}`
}

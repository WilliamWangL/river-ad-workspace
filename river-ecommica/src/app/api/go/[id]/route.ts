import { NextRequest, NextResponse } from 'next/server'
import { getTrackingUrl } from '@/lib/tracking'

export const runtime = 'edge'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:48080'
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '1'

/**
 * 验证重定向 URL 是否安全（防止开放重定向攻击）
 */
function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // 只允许 https 协议
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // 验证 ID 格式（防止注入）
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid offer ID' }, { status: 400 })
  }

  const trackingUrl = getTrackingUrl(id)

  const headers = new Headers()
  headers.set('X-Forwarded-For', request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '')
  headers.set('User-Agent', request.headers.get('user-agent') || '')
  headers.set('Referer', request.headers.get('referer') || '')
  headers.set('tenant-id', TENANT_ID)

  try {
    const response = await fetch(trackingUrl, {
      method: 'GET',
      headers,
      redirect: 'manual'
    })

    const location = response.headers.get('location')
    
    if (location) {
      // 验证重定向 URL 安全性
      if (!isValidRedirectUrl(location)) {
        console.error(`[Tracking] Blocked unsafe redirect: ${location}`)
        return NextResponse.json({ error: 'Invalid redirect destination' }, { status: 400 })
      }
      return NextResponse.redirect(location, 302)
    }

    // 后端返回非重定向响应
    if (!response.ok) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
  } catch (error) {
    // 后端不可达或网络错误
    console.error(`[Tracking] Failed to reach tracking server:`, error)
    return NextResponse.json(
      { error: 'Tracking service temporarily unavailable' },
      { status: 502 }
    )
  }
}

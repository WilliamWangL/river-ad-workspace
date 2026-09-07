'use client'

import { useState, useEffect } from 'react'
import { getCookie } from 'cookies-next'
import { REGION_COOKIE_NAME, DEFAULT_REGION } from '@/lib/region-constants'

interface Region {
  code: string
  name: string
}

interface RegionData {
  currentRegion: string
  regions: Region[]
  loading: boolean
}

/**
 * Client-side hook for fetching region data.
 * Replaces server-side getRegionData() to avoid headers()/cookies() usage in layout.
 */
export function useRegionData(): RegionData {
  const [data, setData] = useState<RegionData>({
    currentRegion: DEFAULT_REGION,
    regions: [],
    loading: true,
  })

  useEffect(() => {
    async function fetchRegionData() {
      // Read region from cookie
      const cookieRegion = getCookie(REGION_COOKIE_NAME) as string | undefined
      const currentRegion = cookieRegion || DEFAULT_REGION

      // Fetch available regions from API
      try {
        const res = await fetch('/app-api/affiliate/region/available', {
          headers: { 'tenant-id': process.env.NEXT_PUBLIC_TENANT_ID || '1' },
        })
        const json = await res.json()
        const regions = json.data || []
        setData({ currentRegion, regions, loading: false })
      } catch {
        setData({
          currentRegion,
          regions: [{ code: DEFAULT_REGION, name: 'Global' }],
          loading: false,
        })
      }
    }
    fetchRegionData()
  }, [])

  return data
}

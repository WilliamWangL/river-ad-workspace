import request from '@/config/axios'

// ==================== 点击记录 ====================

export interface ClickVO {
  clickId: string
  targetType: number
  targetId: number
  merchantId: number
  merchantName: string
  couponId: number
  dealId: number
  gotoUrl: string
  campaignId: number
  landingPageId: number
  sub1: string
  sub2: string
  sub3: string
  sub4: string
  sub5: string
  ip: string
  userAgent: string
  referer: string
  deviceType: string
  country: string
  clickTime: Date
  createTime: Date
}

export const ClickApi = {
  getClickPage: async (params: any) => {
    return await request.get({ url: `/tracking/click/page`, params })
  },
  getClick: async (clickId: string) => {
    return await request.get({ url: `/tracking/click/get?clickId=` + clickId })
  }
}

// ==================== 点击分页查询参数 ====================

export interface ClickPageReqVO {
  pageNo: number
  pageSize: number
  targetType?: number
  targetId?: number
  merchantId?: number
  couponId?: number
  dealId?: number
  campaignId?: number
  sub1?: string
  ip?: string
  country?: string
  clickTime?: string[]
}

// ==================== 转化记录 ====================

export interface ConversionVO {
  id: number
  clickId: string
  networkCode: string
  externalConversionId: string
  conversionType: number
  commission: number
  currency: string
  status: number
  networkPayload: string
  conversionTime: Date
  createTime: Date
}

export const ConversionApi = {
  getConversionPage: async (params: any) => {
    return await request.get({ url: `/tracking/conversion/page`, params })
  },
  getConversion: async (id: number) => {
    return await request.get({ url: `/tracking/conversion/get?id=` + id })
  },
  updateConversion: async (data: ConversionVO) => {
    return await request.put({ url: `/tracking/conversion/update`, data })
  },
  exportConversion: async (params) => {
    return await request.download({ url: `/tracking/conversion/export-excel`, params })
  }
}

// ==================== 追踪链接 ====================

export interface TrackingLinkVO {
  id: number
  targetType: number
  targetId: number
  merchantId?: number
  slug: string
  presetSub1: string
  presetSub2: string
  presetSub3: string
  presetSub4: string
  presetSub5: string
  utmParams: string
  status: number
  createTime: Date
}

// ==================== 追踪链接分页查询参数 ====================

export interface TrackingLinkPageReqVO {
  pageNo: number
  pageSize: number
  targetType?: number
  targetId?: number
  slug?: string
  status?: number
}

export const TrackingLinkApi = {
  getTrackingLinkPage: async (params: any) => {
    return await request.get({ url: `/tracking/link/page`, params })
  },
  getTrackingLink: async (id: number) => {
    return await request.get({ url: `/tracking/link/get?id=` + id })
  },
  createTrackingLink: async (data: TrackingLinkVO) => {
    return await request.post({ url: `/tracking/link/create`, data })
  },
  updateTrackingLink: async (data: TrackingLinkVO) => {
    return await request.put({ url: `/tracking/link/update`, data })
  },
  deleteTrackingLink: async (id: number) => {
    return await request.delete({ url: `/tracking/link/delete?id=` + id })
  },
  exportTrackingLink: async (params) => {
    return await request.download({ url: `/tracking/link/export-excel`, params })
  }
}

// ==================== 未归因转化 ====================

export interface UnattributedConversionVO {
  id: number
  networkCode: string
  externalConversionId: string
  conversionType: number
  commission: number
  currency: string
  networkPayload: string
  rawRequest: string
  attributionFailReason: string
  conversionTime: Date
  createTime: Date
}

export const UnattributedConversionApi = {
  getUnattributedConversionPage: async (params: any) => {
    return await request.get({ url: `/tracking/unattributed-conversion/page`, params })
  },
  getUnattributedConversion: async (id: number) => {
    return await request.get({ url: `/tracking/unattributed-conversion/get?id=` + id })
  }
}

// ==================== 归因记录 ====================

export interface AttributionVO {
  id: number
  conversionId: number
  clickId: string
  attributionType: number
  confidenceScore: number
  attributionWindow: number
  createTime: Date
}

export const AttributionApi = {
  getAttributionPage: async (params: any) => {
    return await request.get({ url: `/tracking/attribution/page`, params })
  },
  getAttribution: async (id: number) => {
    return await request.get({ url: `/tracking/attribution/get?id=` + id })
  }
}

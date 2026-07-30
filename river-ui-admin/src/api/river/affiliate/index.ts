import request from '@/config/axios'

// ==================== 联盟网络 ====================

export interface AffiliateNetworkVO {
  id: number
  code: string
  name: string
  type: number
  apiBaseUrl: string
  status: number
  websiteUrl: string
  logoUrl: string
  description: string
  remark: string
  createTime: Date
}

export const AffiliateNetworkApi = {
  // 查询联盟网络分页
  getAffiliateNetworkPage: async (params: any) => {
    return await request.get({ url: `/affiliate/network/page`, params })
  },

  // 查询联盟网络列表
  getAffiliateNetworkList: async () => {
    return await request.get({ url: `/affiliate/network/list` })
  },

  // 查询联盟网络详情
  getAffiliateNetwork: async (id: number) => {
    return await request.get({ url: `/affiliate/network/get?id=` + id })
  },

  // 新增联盟网络
  createAffiliateNetwork: async (data: AffiliateNetworkVO) => {
    return await request.post({ url: `/affiliate/network/create`, data })
  },

  // 修改联盟网络
  updateAffiliateNetwork: async (data: AffiliateNetworkVO) => {
    return await request.put({ url: `/affiliate/network/update`, data })
  },

  // 删除联盟网络
  deleteAffiliateNetwork: async (id: number) => {
    return await request.delete({ url: `/affiliate/network/delete?id=` + id })
  },

  // 导出联盟网络 Excel
  exportAffiliateNetwork: async (params) => {
    return await request.download({ url: `/affiliate/network/export-excel`, params })
  },

  // 同步数据（Merchant + Offer）
  syncData: async (params: { networkId?: string; code?: string }) => {
    return await request.post({ url: `/affiliate/network/sync-data`, params })
  },

  // 同步优惠（Coupon + Deal）
  syncCoupons: async (params: { networkId?: string; code?: string }) => {
    return await request.post({ url: `/affiliate/network/sync-coupons`, params })
  }
}

// ==================== 商家 ====================

export interface MerchantVO {
  id: number
  networkId: number
  externalId: string
  name: string
  slug: string
  domain: string
  logoUrl: string
  description: string
  /** 商家简介（短文本，为空回退 description） */
  intro?: string
  /** 商家描述（长富文本，为空回退 description） */
  about?: string
  rating: number
  status: number
  regions: string
  categoryIds: string
  defaultOfferId: number
  createTime: Date
}

export const MerchantApi = {
  // 查询商家分页
  getMerchantPage: async (params: any) => {
    return await request.get({ url: `/affiliate/merchant/page`, params })
  },

  // 查询商家列表
  getMerchantList: async () => {
    return await request.get({ url: `/affiliate/merchant/list` })
  },

  // 查询商家详情
  getMerchant: async (id: number) => {
    return await request.get({ url: `/affiliate/merchant/get?id=` + id })
  },

  // 新增商家
  createMerchant: async (data: MerchantVO) => {
    return await request.post({ url: `/affiliate/merchant/create`, data })
  },

  // 修改商家
  updateMerchant: async (data: MerchantVO) => {
    return await request.put({ url: `/affiliate/merchant/update`, data })
  },

  // 删除商家
  deleteMerchant: async (id: number) => {
    return await request.delete({ url: `/affiliate/merchant/delete?id=` + id })
  },

  // 导出商家 Excel
  exportMerchant: async (params) => {
    return await request.download({ url: `/affiliate/merchant/export-excel`, params })
  }
}

// ==================== 分类 ====================

export interface CategoryVO {
  id: number
  parentId: number
  name: string
  slug: string
  level: number
  sort: number
  icon: string
  region: string
  status: number
  createTime: Date
}

export const CategoryApi = {
  // 查询分类列表
  getCategoryList: async (params?: any) => {
    return await request.get({ url: `/affiliate/category/list`, params })
  },

  // 查询分类详情
  getCategory: async (id: number) => {
    return await request.get({ url: `/affiliate/category/get?id=` + id })
  },

  // 新增分类
  createCategory: async (data: CategoryVO) => {
    return await request.post({ url: `/affiliate/category/create`, data })
  },

  // 修改分类
  updateCategory: async (data: CategoryVO) => {
    return await request.put({ url: `/affiliate/category/update`, data })
  },

  // 删除分类
  deleteCategory: async (id: number) => {
    return await request.delete({ url: `/affiliate/category/delete?id=` + id })
  },

  // 获取可用地区列表
  getAvailableRegions: async () => {
    return await request.get({ url: `/affiliate/category/regions` })
  }
}

// ==================== Offer ====================

export interface OfferVO {
  id: number
  merchantId: number
  networkId: number
  externalId: string
  name: string
  description: string
  commissionType: number
  commissionValue: number
  currency: string
  cookieDays: number
  gotoUrl: string
  landingUrl: string
  status: number
  regions: string
  categoryIds: string
  tags: string
  imageUrl: string
  epc: number
  conversionRate: number
  featured: boolean
  hotScore: number
  createTime: Date
}

export const OfferApi = {
  // 查询 Offer 分页
  getOfferPage: async (params: any) => {
    return await request.get({ url: `/affiliate/offer/page`, params })
  },

  // 查询 Offer 列表
  getOfferList: async () => {
    return await request.get({ url: `/affiliate/offer/list` })
  },

  // 查询 Offer 详情
  getOffer: async (id: number) => {
    return await request.get({ url: `/affiliate/offer/get?id=` + id })
  },

  // 新增 Offer
  createOffer: async (data: OfferVO) => {
    return await request.post({ url: `/affiliate/offer/create`, data })
  },

  // 修改 Offer
  updateOffer: async (data: OfferVO) => {
    return await request.put({ url: `/affiliate/offer/update`, data })
  },

  // 删除 Offer
  deleteOffer: async (id: number) => {
    return await request.delete({ url: `/affiliate/offer/delete?id=` + id })
  },

  // 导出 Offer Excel
  exportOffer: async (params) => {
    return await request.download({ url: `/affiliate/offer/export-excel`, params })
  }
}

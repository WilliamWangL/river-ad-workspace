import { Deal, Store, Coupon, BlogPost, Category, Offer } from '@/types'

// 服务端内部 API URL（Docker 内部网络）
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:48080/app-api'
// 客户端 API URL（通过 nginx 代理）
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '/app-api'
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '1'

// 根据运行环境选择 API URL
function getApiBaseUrl(): string {
  // 服务端使用内部 URL，客户端使用公开 URL
  if (typeof window === 'undefined') {
    return INTERNAL_API_URL
  }
  return PUBLIC_API_URL
}

function fetchWithTenant(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'tenant-id': TENANT_ID,
    },
  })
}

// BlogPost type 映射
const POST_TYPE_MAP: Record<number, BlogPost['type']> = {
  1: 'deal',
  2: 'review',
  3: 'tutorial',
  4: 'news'
}

function mapPostType(post: Record<string, unknown>): BlogPost {
  return {
    ...post,
    type: POST_TYPE_MAP[post.type as number] || 'news'
  } as BlogPost
}

export async function fetchDeals(params?: { merchantId?: number; featured?: boolean; categoryId?: number; pageNo?: number; pageSize?: number; regions?: string[] }): Promise<PageResult<Deal>> {
  const url = new URL(`${getApiBaseUrl()}/coupon/deal/page`)
  if (params?.merchantId) url.searchParams.set('merchantId', String(params.merchantId))
  if (params?.featured !== undefined) url.searchParams.set('featured', String(params.featured))
  if (params?.categoryId) url.searchParams.set('categoryId', String(params.categoryId))
  if (params?.pageNo) url.searchParams.set('pageNo', String(params.pageNo))
  if (params?.pageSize) url.searchParams.set('pageSize', String(params.pageSize))
  if (params?.regions?.length) {
    params.regions.forEach(r => url.searchParams.append('regions', r))
  }

  const res = await fetchWithTenant(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Fetch deals failed')
  const json = await res.json()
  return json.data || { total: 0, list: [] }
}

export async function fetchDealBySlug(slug: string): Promise<Deal | null> {
  const res = await fetchWithTenant(`${getApiBaseUrl()}/coupon/deal/get-by-slug?slug=${encodeURIComponent(slug)}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error('Fetch deal failed')
  const json = await res.json()
  return json.data || null
}

export interface PageResult<T> {
  total: number;
  list: T[];
}

export async function fetchStores(params?: { pageNo?: number; pageSize?: number; name?: string; regions?: string[] }): Promise<PageResult<Store>> {
  const url = new URL(`${getApiBaseUrl()}/affiliate/merchant/page`);
  if (params?.pageNo) url.searchParams.set('pageNo', String(params.pageNo));
  if (params?.pageSize) url.searchParams.set('pageSize', String(params.pageSize));
  if (params?.name) url.searchParams.set('name', params.name);
  if (params?.regions?.length) {
    params.regions.forEach(r => url.searchParams.append('regions', r));
  }

  const res = await fetchWithTenant(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Fetch stores failed');
  const json = await res.json();
  return json.data || { total: 0, list: [] };
}

export async function fetchStoreBySlug(slug: string): Promise<Store | null> {
  const res = await fetchWithTenant(`${getApiBaseUrl()}/affiliate/merchant/get-by-slug?slug=${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error('Fetch store failed')
  const json = await res.json()
  return json.data || null
}

export async function fetchCoupons(params?: { merchantId?: number; verified?: boolean; categoryId?: number; pageNo?: number; pageSize?: number; regions?: string[] }): Promise<PageResult<Coupon>> {
  const url = new URL(`${getApiBaseUrl()}/coupon/coupon/page`)
  if (params?.merchantId) url.searchParams.set('merchantId', String(params.merchantId))
  if (params?.verified !== undefined) url.searchParams.set('verified', String(params.verified))
  if (params?.categoryId) url.searchParams.set('categoryId', String(params.categoryId))
  if (params?.pageNo) url.searchParams.set('pageNo', String(params.pageNo))
  if (params?.pageSize) url.searchParams.set('pageSize', String(params.pageSize))
  if (params?.regions?.length) {
    params.regions.forEach(r => url.searchParams.append('regions', r))
  }

  const res = await fetchWithTenant(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Fetch coupons failed')
  const json = await res.json()
  return json.data || { total: 0, list: [] }
}

export async function fetchPosts(params?: { type?: string; featured?: boolean; pageNo?: number; pageSize?: number }): Promise<PageResult<BlogPost>> {
  const url = new URL(`${getApiBaseUrl()}/blog/post/page`)
  if (params?.type) url.searchParams.set('type', params.type)
  if (params?.featured !== undefined) url.searchParams.set('featured', String(params.featured))
  if (params?.pageNo) url.searchParams.set('pageNo', String(params.pageNo))
  if (params?.pageSize) url.searchParams.set('pageSize', String(params.pageSize))

  const res = await fetchWithTenant(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Fetch posts failed')
  const json = await res.json()
  const data = json.data || { total: 0, list: [] }
  return {
    ...data,
    list: data.list.map(mapPostType)
  }
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const res = await fetchWithTenant(`${getApiBaseUrl()}/blog/post/get-by-slug?slug=${encodeURIComponent(slug)}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error('Fetch post failed')
  const json = await res.json()
  return json.data ? mapPostType(json.data) : null
}

export async function fetchCategories(params?: { region?: string }): Promise<Category[]> {
  const url = new URL(`${getApiBaseUrl()}/affiliate/category/tree`)
  if (params?.region) {
    url.searchParams.set('region', params.region)
  }
  const res = await fetchWithTenant(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Fetch categories failed')
  const json = await res.json()
  return json.data || []
}

export async function fetchCategoryBySlug(slug: string, region?: string): Promise<Category | null> {
  const url = new URL(`${getApiBaseUrl()}/affiliate/category/get-by-slug`)
  url.searchParams.set('slug', slug)
  if (region) {
    url.searchParams.set('region', region)
  }
  const res = await fetchWithTenant(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Fetch category failed')
  const json = await res.json()
  return json.data || null
}

export interface Region {
  code: string;
  name: string;
}

export async function fetchAvailableRegions(): Promise<Region[]> {
  const res = await fetchWithTenant(`${getApiBaseUrl()}/affiliate/region/available`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error('Fetch regions failed')
  const json = await res.json()
  return json.data || []
}

export async function fetchOffersByMerchant(merchantId: number, region?: string): Promise<Offer[]> {
  const url = new URL(`${getApiBaseUrl()}/affiliate/offer/list-by-merchant`)
  url.searchParams.set('merchantId', String(merchantId))
  if (region) {
    url.searchParams.set('region', region)
  }

  const res = await fetchWithTenant(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Fetch offers failed')
  const json = await res.json()
  return json.data || []
}

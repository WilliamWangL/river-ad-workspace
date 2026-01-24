import { Deal, Store, Coupon, BlogPost, Category } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:48080/app-api'
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '1'

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

export async function fetchDeals(params?: { merchantId?: number; featured?: boolean; pageNo?: number; pageSize?: number; regions?: string[] }): Promise<PageResult<Deal>> {
  const url = new URL(`${API_BASE_URL}/coupon/deal/page`)
  if (params?.merchantId) url.searchParams.set('merchantId', String(params.merchantId))
  if (params?.featured !== undefined) url.searchParams.set('featured', String(params.featured))
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
  // 如果是纯数字，则按 id 获取
  const isNumericId = /^\d+$/.test(slug);
  const endpoint = isNumericId
    ? `${API_BASE_URL}/coupon/deal/get?id=${encodeURIComponent(slug)}`
    : `${API_BASE_URL}/coupon/deal/get-by-slug?slug=${encodeURIComponent(slug)}`;

  const res = await fetchWithTenant(endpoint, {
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
  const url = new URL(`${API_BASE_URL}/affiliate/merchant/page`);
  if (params?.pageNo) url.searchParams.set('pageNo', String(params.pageNo));
  if (params?.pageSize) url.searchParams.set('pageSize', String(params.pageSize));
  if (params?.name) url.searchParams.set('name', params.name);
  if (params?.regions?.length) {
    params.regions.forEach(r => url.searchParams.append('regions', r));
  }

  const res = await fetchWithTenant(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Fetch stores failed');
  const json = await res.json();
  return json.data || { total: 0, list: [] };
}

export async function fetchStoreBySlug(slug: string): Promise<Store | null> {
  const res = await fetchWithTenant(`${API_BASE_URL}/affiliate/merchant/get-by-slug?slug=${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error('Fetch store failed')
  const json = await res.json()
  return json.data || null
}

export async function fetchCoupons(params?: { merchantId?: number; verified?: boolean; pageNo?: number; pageSize?: number; regions?: string[] }): Promise<PageResult<Coupon>> {
  const url = new URL(`${API_BASE_URL}/coupon/coupon/page`)
  if (params?.merchantId) url.searchParams.set('merchantId', String(params.merchantId))
  if (params?.verified !== undefined) url.searchParams.set('verified', String(params.verified))
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
  const url = new URL(`${API_BASE_URL}/blog/post/page`)
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
  const res = await fetchWithTenant(`${API_BASE_URL}/blog/post/get-by-slug?slug=${encodeURIComponent(slug)}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error('Fetch post failed')
  const json = await res.json()
  return json.data ? mapPostType(json.data) : null
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetchWithTenant(`${API_BASE_URL}/affiliate/category/tree`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Fetch categories failed')
  const json = await res.json()
  return json.data || []
}

export interface Region {
  code: string;
  name: string;
}

export async function fetchAvailableRegions(): Promise<Region[]> {
  const res = await fetchWithTenant(`${API_BASE_URL}/affiliate/region/available`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error('Fetch regions failed')
  const json = await res.json()
  return json.data || []
}

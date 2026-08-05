export interface MerchantSimple {
  id: number;
  name: string;
  slug: string;
  logoUrl: string;
}

export interface Deal {
  id: number;
  slug: string;
  title: string;
  description: string;
  /** SEO 页面标题（为空回退 title） */
  metaTitle?: string;
  /** SEO meta 描述（为空回退 description） */
  metaDescription?: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  imageUrl: string;
  startTime: string;
  endTime: string;
  featured: boolean;
  exclusive?: boolean;
  gotoUrl: string;
  merchant: MerchantSimple;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  /** 商家简介（短文本，为空回退 description） */
  intro?: string;
  /** 商家描述（长富文本，为空回退 description） */
  about?: string;
  /** SEO 页面标题（为空回退 name） */
  metaTitle?: string;
  /** SEO meta 描述（为空回退 intro/description） */
  metaDescription?: string;
  domain: string;
  rating: number;
  dealCount: number;
  couponCount: number;
  regions?: string[];
}

export interface Offer {
  id: number;
  merchantId: number;
  name: string;
  description?: string;
  commissionType: number;
  commissionValue: number;
  currency?: string;
  regions?: string[];
  gotoUrl?: string;
}

export interface Coupon {
  id: number;
  code: string;
  title?: string;
  /** SEO 页面标题（为空回退 title） */
  metaTitle?: string;
  /** SEO meta 描述（为空回退 terms） */
  metaDescription?: string;
  description: string;
  discountType: number;
  discountValue: number;
  minPurchase?: number;
  endTime: string;
  verified: boolean;
  gotoUrl: string;
  merchant: MerchantSimple;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage: string;
  authorName: string;
  authorAvatar?: string;
  publishedAt: string;
  type: 'deal' | 'review' | 'tutorial' | 'news';
  viewCount?: number;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  level?: number;
  parentId?: number;
  region?: string;
  children?: Category[];
}

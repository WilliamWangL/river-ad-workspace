export interface MerchantSimple {
  id: number;
  name: string;
  slug: string;
  logoUrl: string;
}

export interface Deal {
  id: number;
  slug?: string;
  title: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  imageUrl: string;
  startTime: string;
  endTime: string;
  featured: boolean;
  exclusive?: boolean;
  gotoUrl: string;
  trackingLinkId?: string;
  merchant: MerchantSimple;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  domain: string;
  rating: number;
  dealCount: number;
  couponCount: number;
  trackingLinkId?: string;
  regions?: string[];
}

export interface Coupon {
  id: number;
  code: string;
  title?: string;
  description: string;
  discountType: number;
  discountValue: number;
  minPurchase?: number;
  endTime: string;
  verified: boolean;
  gotoUrl: string;
  trackingLinkId?: string;
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
  children?: Category[];
}

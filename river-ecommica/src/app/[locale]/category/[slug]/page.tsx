import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchDeals, fetchCoupons, fetchCategories, fetchCategoryBySlug } from '@/lib/api';
import { getRegionFilter, DEFAULT_REGION } from '@/lib/region-constants';
import { Category } from '@/types';
import DealCard from '@/components/deal/DealCard';
import CouponCard from '@/components/coupon/CouponCard';
import { EmptyState } from '@/components/ui/empty-state';
import { JsonLd, BASE_URL, generateBreadcrumbJsonLd, generateItemListJsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Baby,
  ShoppingBasket,
  Heart,
  Tag,
  Ticket,
  ArrowRight,
  type LucideIcon
} from 'lucide-react';

// 使用动态渲染，因为分类页面需要获取实时数据
export const dynamic = 'force-dynamic';

const iconMap: Record<string, LucideIcon> = {
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Baby,
  ShoppingBasket,
  Heart,
};

// Helper function to find category by slug in category tree
function findCategoryBySlug(categories: Category[], slug: string): Category | null {
  for (const category of categories) {
    if (category.slug === slug) return category;
    if (category.children) {
      const found = findCategoryBySlug(category.children, slug);
      if (found) return found;
    }
  }
  return null;
}

// Helper function to find parent category
function findParentCategory(categories: Category[], slug: string): Category | null {
  for (const category of categories) {
    if (category.slug === slug) return category;
    if (category.children?.some((child: Category) => child.slug === slug)) return category;
  }
  return null;
}

// Helper function to collect all slugs from category tree
function collectCategorySlugs(categories: Category[]): { slug: string }[] {
  const params: { slug: string }[] = [];
  for (const category of categories) {
    params.push({ slug: category.slug });
    if (category.children) {
      for (const child of category.children) {
        params.push({ slug: child.slug });
      }
    }
  }
  return params;
}

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ region?: string }>;
}

export async function generateStaticParams() {
  try {
    const categories = await fetchCategories();
    return collectCategorySlugs(categories);
  } catch {
    // 构建时 API 不可用，返回空数组，页面将在运行时动态渲染
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'CategoryDetail' });
  const categories = await fetchCategories();
  // 地区树里找不到时通过 get-by-slug 兜底（支持跨地区），避免误返回 Not Found 元信息
  const category = findCategoryBySlug(categories, slug) || await fetchCategoryBySlug(slug);

  if (!category) {
    return { title: t('meta.notFound') };
  }

  const categoryNameLower = category.name.toLowerCase();
  return {
    title: t('meta.title', { name: category.name }),
    description: t('meta.description', { name: categoryNameLower }),
    alternates: {
      canonical: `${BASE_URL}/${locale}/category/${category.slug}`,
      languages: {
        'en': `${BASE_URL}/en/category/${category.slug}`,
        'zh': `${BASE_URL}/zh/category/${category.slug}`,
      },
    },
    openGraph: {
      title: t('meta.title', { name: category.name }),
      description: t('meta.description', { name: categoryNameLower }),
      url: `${BASE_URL}/${locale}/category/${category.slug}`,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('meta.title', { name: category.name }),
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title', { name: category.name }),
      description: t('meta.description', { name: categoryNameLower }),
      images: ['/og-image.png'],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const queryParams = await searchParams;
  // 使用 searchParams 中的 region 或默认值，避免使用 headers()/cookies()（与 ISR 冲突）
  const region = queryParams?.region || DEFAULT_REGION;
  const t = await getTranslations({ locale, namespace: 'CategoryDetail' });

  const regionFilter = getRegionFilter(region);
  const regionsArray = regionFilter ? [regionFilter] : undefined;

  // First fetch categories to find the category by slug
  const categories = await fetchCategories({ region: regionFilter });
  // 当前地区树里找不到时，通过 get-by-slug 兜底（后端支持跨地区回退），
  // 避免其他地区分类链接命中带 noindex 的 404 页
  const category = findCategoryBySlug(categories, slug)
    || await fetchCategoryBySlug(slug, regionFilter);

  if (!category) {
    notFound();
  }

  // 兜底命中的分类可能属于其他地区，用分类自身地区查询内容更准确
  const categoryRegion = category.region && category.region !== '00' ? category.region : undefined;
  const effectiveRegions = regionsArray ?? (categoryRegion ? [categoryRegion] : undefined);

  // Then fetch deals and coupons filtered by categoryId
  const [dealsResult, couponsResult] = await Promise.all([
    fetchDeals({
      categoryId: category.id,
      regions: effectiveRegions,
      pageSize: 8
    }),
    fetchCoupons({
      categoryId: category.id,
      regions: effectiveRegions,
      pageSize: 6
    }),
  ]);

  const deals = dealsResult.list;
  const coupons = couponsResult.list;

  const IconComponent = iconMap[category.icon || 'Tag'] || Tag;

  const parentCategory = findParentCategory(categories, slug);
  const isSubcategory = parentCategory != null && parentCategory.slug !== slug;
  // 兜底命中时分类不在当前地区树中，直接使用接口返回的 children
  const subcategories = isSubcategory ? [] : (parentCategory?.children || category.children || []);

  const breadcrumbs = [
    { label: t('breadcrumbHome'), href: '/' },
    { label: t('breadcrumbCategories'), href: '/categories' },
    ...(parentCategory && parentCategory.slug !== slug
      ? [{ label: parentCategory.name, href: `/category/${parentCategory.slug}` }]
      : []),
    { label: category.name, href: `/category/${category.slug}` },
  ];

  const breadcrumbJsonLdItems = breadcrumbs.map(item => ({
    name: item.label,
    url: `${BASE_URL}/${locale}${item.href}`
  }));
  const dealItemList = deals
    .filter(deal => deal.slug)
    .map(deal => ({
      name: deal.title,
      url: `${BASE_URL}/${locale}/deals/${deal.slug}`
    }));
  const couponItemList = coupons
    .filter(coupon => coupon.id)
    .map(coupon => ({
      name: `${coupon.merchant.name} - ${coupon.title || coupon.description}`,
      url: `${BASE_URL}/${locale}/coupons#coupon-${coupon.id}`
    }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />
      {dealItemList.length > 0 && (
        <JsonLd data={generateItemListJsonLd(dealItemList, `${category.name} Deals`)} />
      )}
      {couponItemList.length > 0 && (
        <JsonLd data={generateItemListJsonLd(couponItemList, `${category.name} Coupons`)} />
      )}
      <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="page-header py-12 md:py-16">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-200/20 to-violet-200/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            {/* Title Section */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100">
                  <IconComponent className="w-8 h-8 text-cyan-600" />
                </div>
                <div className="badge-exclusive">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('badgeBestDeals')}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight mb-4">
                {category.name}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {t('heroDescription', { name: category.name.toLowerCase() })}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4 md:gap-6 flex-wrap lg:flex-nowrap">
              <div className="stat-card min-w-[120px]">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                  <Tag className="w-4 h-4" />
                  <span>{t('statDeals')}</span>
                </div>
                <span className="stat-value">{deals.length}</span>
              </div>
              <div className="stat-card min-w-[120px]">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                  <Ticket className="w-4 h-4" />
                  <span>{t('statCoupons')}</span>
                </div>
                <span className="stat-value text-gradient-savings">{coupons.length}</span>
              </div>
            </div>
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {subcategories.map(sub => (
                <Link
                  key={sub.id}
                  href={`/${locale}/category/${sub.slug}`}
                  className="group px-4 py-2 bg-card/80 backdrop-blur-sm hover:bg-primary/10 border border-border/60 hover:border-primary/30 rounded-full text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Deals Section */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
              <Tag className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                {t('sectionDeals')}
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                {t('dealsAvailable', { count: deals.length })}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/deals`}
            className="group hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-colors"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {deals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deals.map(deal => (
              <DealCard key={deal.id} deal={deal} locale={locale} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="bag"
            title={t('emptyDealsTitle')}
            description={t('emptyDealsDescription', { name: category.name.toLowerCase() })}
          />
        )}
      </section>

      {/* Coupons Section */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
              <Ticket className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                {t('sectionCoupons')}
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                {t('couponsAvailable', { count: coupons.length })}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/coupons`}
            className="group hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-colors"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} locale={locale} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="ticket"
            title={t('emptyCouponsTitle')}
            description={t('emptyCouponsDescription', { name: category.name.toLowerCase() })}
          />
        )}
      </section>
      </main>
    </>
  );
}

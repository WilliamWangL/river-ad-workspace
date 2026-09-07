import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchStores } from '@/lib/api';
import { getCurrentRegion } from '@/lib/region';
import { getRegionFilter } from '@/lib/region-constants';
import { PAGINATION } from '@/constants/pagination';
import StoreCard from '@/components/store/StoreCard';
import { StoresSearchBar } from '@/components/store/StoresSearchBar';
import { StorePagination } from '@/components/store/StorePagination';
import { Button } from '@/components/ui/button';
import { JsonLd, BASE_URL, generateBreadcrumbJsonLd, generateItemListJsonLd } from '@/components/seo/JsonLd';
import {
  Store as StoreIcon,
  Tag,
  Ticket,
  Compass
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'stores' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/stores`,
      languages: {
        'en': `${BASE_URL}/en/stores`,
        'zh': `${BASE_URL}/zh/stores`,
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `${BASE_URL}/${locale}/stores`,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('meta.title'),
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title'),
      description: t('meta.description'),
      images: ['/og-image.png'],
    },
  };
}

export default async function StoresPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string; region?: string }>
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const queryParams = await searchParams;
  const searchQuery = queryParams.q?.trim() || '';
  const currentPage = parseInt(queryParams.page || String(PAGINATION.DEFAULT_PAGE), 10);
  const pageSize = PAGINATION.PAGE_SIZE.STORE;
  const region = await getCurrentRegion(queryParams);
  const t = await getTranslations({ locale, namespace: 'stores' });

  const regionFilter = getRegionFilter(region);
  const regionsArray = regionFilter ? [regionFilter] : undefined;

  const storesResult = await fetchStores({
    pageNo: currentPage,
    pageSize,
    name: searchQuery || undefined,
    regions: regionsArray
  });
  const stores = storesResult.list || [];
  const total = storesResult.total || 0;

  const totalStores = total;
  const totalDeals = stores.reduce((acc, s) => acc + (s.dealCount || 0), 0);
  const totalCoupons = stores.reduce((acc, s) => acc + (s.couponCount || 0), 0);

  const breadcrumbJsonLdItems = [
    { name: 'Home', url: `${BASE_URL}/${locale}` },
    { name: 'Stores', url: `${BASE_URL}/${locale}/stores` },
  ];
  const itemListJsonLdItems = stores
    .filter(store => store.slug)
    .map(store => ({
      name: store.name,
      url: `${BASE_URL}/${locale}/stores/${store.slug}`
    }));

  return (
    <>
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />
      {itemListJsonLdItems.length > 0 && (
        <JsonLd data={generateItemListJsonLd(itemListJsonLdItems, 'Stores')} />
      )}
      <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden section-gradient border-b border-border/50">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 left-[10%] w-16 h-16 rounded-2xl bg-card shadow-lg border border-border rotate-12 opacity-60" />
          <div className="absolute top-20 right-[15%] w-12 h-12 rounded-xl bg-card shadow-md border border-border -rotate-6 opacity-50" />
          <div className="absolute bottom-12 left-[20%] w-14 h-14 rounded-2xl bg-card shadow-lg border border-border rotate-6 opacity-40" />
          <div className="absolute top-1/3 right-[8%] w-10 h-10 rounded-lg bg-card shadow-md border border-border rotate-12 opacity-30" />

          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Compass className="w-4 h-4" />
              <span>{t('breadcrumbExplore')}</span>
              <span className="text-primary/40">/</span>
              <span className="text-primary font-medium">{t('breadcrumbStores')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground tracking-tight mb-4">
              {t('heroTitle1')}
              <span className="relative ml-3">
                <span className="relative z-10 text-gradient-primary">{t('heroTitle2')}</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              {t('heroDescription', { count: totalStores })}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="stat-card min-w-[120px]">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                  <StoreIcon className="w-4 h-4 text-primary" />
                  <span>{t('statStores')}</span>
                </div>
                <span className="stat-value">{totalStores}</span>
              </div>

              <div className="stat-card min-w-[120px]">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>{t('statDeals')}</span>
                </div>
                <span className="stat-value">{totalDeals}</span>
              </div>

              <div className="stat-card min-w-[120px]">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                  <Ticket className="w-4 h-4 text-emerald-500" />
                  <span>{t('statCodes')}</span>
                </div>
                <span className="stat-value">{totalCoupons}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-14 sm:top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <Suspense fallback={<div className="h-11 bg-muted animate-pulse rounded-xl max-w-md" />}>
            <StoresSearchBar
              placeholder={t('searchPlaceholder')}
              className="max-w-md"
            />
          </Suspense>
        </div>
      </div>

      <section className="container mx-auto px-4 py-8 md:py-12">
        {stores.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {stores.map(store => (
                <StoreCard key={store.id} store={store} locale={locale} />
              ))}
            </div>
            <div className="mt-12">
              <StorePagination total={total} pageSize={pageSize} currentPage={currentPage} />
            </div>
          </>
        ) : (
          <div className="card-elevated p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <StoreIcon className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{t('emptyTitle')}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('emptyDescription')}
            </p>
            <Button variant="outline" className="mt-6 rounded-xl" asChild>
              <Link href={`/${locale}/stores`}>{t('clearSearch')}</Link>
            </Button>
          </div>
        )}
      </section>
      </main>
    </>
  );
}

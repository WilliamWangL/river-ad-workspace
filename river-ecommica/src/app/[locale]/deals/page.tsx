import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchDeals } from '@/lib/api';
import { getCurrentRegion } from '@/lib/region';
import { getRegionFilter } from '@/lib/region-constants';
import { PAGINATION } from '@/constants/pagination';
import DealCard from '@/components/deal/DealCard';
import { DealsSearchBar } from '@/components/deal/DealsSearchBar';
import { DealPagination } from '@/components/deal/DealPagination';
import { EmptyState } from '@/components/ui/empty-state';
import { JsonLd, BASE_URL, generateBreadcrumbJsonLd, generateItemListJsonLd } from '@/components/seo/JsonLd';
import {
  Tag,
  Percent,
  Clock,
  Zap
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'deals' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/deals`,
      languages: {
        'en': `${BASE_URL}/en/deals`,
        'zh': `${BASE_URL}/zh/deals`,
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `${BASE_URL}/${locale}/deals`,
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

export default async function DealsPage({
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
  const pageSize = PAGINATION.PAGE_SIZE.DEAL;
  const region = await getCurrentRegion(queryParams);
  const t = await getTranslations({ locale, namespace: 'deals' });

  const regionFilter = getRegionFilter(region);
  const regionsArray = regionFilter ? [regionFilter] : undefined;

  const dealsResult = await fetchDeals({
    pageNo: currentPage,
    pageSize,
    regions: regionsArray
  });
  const allDeals = dealsResult.list || [];
  const total = dealsResult.total || 0;

  const deals = searchQuery
    ? allDeals.filter(deal =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.merchant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allDeals;

  const now = new Date();
  const totalDeals = total;
  const activeDeals = deals.filter(d => !d.endTime || new Date(d.endTime) > now).length;
  const avgDiscount = totalDeals > 0
    ? Math.round(allDeals.reduce((acc, d) => acc + (d.discountPercent || 0), 0) / Math.max(1, allDeals.length))
    : 0;

  const breadcrumbJsonLdItems = [
    { name: 'Home', url: `${BASE_URL}/${locale}` },
    { name: 'Deals', url: `${BASE_URL}/${locale}/deals` },
  ];
  const itemListJsonLdItems = deals
    .filter(deal => deal.slug)
    .map(deal => ({
      name: deal.title,
      url: `${BASE_URL}/${locale}/deals/${deal.slug}`
    }));

  return (
    <>
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />
      {itemListJsonLdItems.length > 0 && (
        <JsonLd data={generateItemListJsonLd(itemListJsonLdItems, 'Deals')} />
      )}
      <main className="min-h-screen bg-background">
      {/* Hero Section - Compact & Urgent Style */}
      <section className="relative section-gradient overflow-hidden border-b border-border/50">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left: Title & Description */}
            <div className="flex-1 max-w-2xl">
              <div className="badge-deal mb-6">
                <Zap className="w-3.5 h-3.5" />
                {t('badgeLiveDeals')}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-4 text-foreground">
                {t('heroTitle1')}
                <span className="block text-gradient-primary">{t('heroTitle2')}</span>
              </h1>

              <p className="text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed">
                {t('heroDescription')}
              </p>
            </div>

            {/* Right: Stats Pills */}
            <div className="flex flex-wrap gap-4">
              <div className="stat-card min-w-[140px]">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                  <Tag className="w-4 h-4 text-primary" />
                  <span>{t('statTotalDeals')}</span>
                </div>
                <span className="stat-value">{totalDeals}</span>
              </div>

              <div className="stat-card min-w-[140px]">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>{t('statActiveNow')}</span>
                </div>
                <span className="stat-value text-emerald-600">{activeDeals}</span>
              </div>

              <div className="stat-card min-w-[140px] border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
                  <Percent className="w-4 h-4" />
                  <span>{t('statAvgSavings')}</span>
                </div>
                <span className="stat-value text-gradient-primary">{avgDiscount}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <Suspense fallback={<div className="h-11 bg-muted animate-pulse rounded-xl max-w-md" />}>
            <DealsSearchBar
              placeholder={t('searchPlaceholder')}
              className="max-w-md"
            />
          </Suspense>
        </div>
      </div>

      {/* Deals Grid */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        {deals.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {deals.map(deal => (
                <DealCard key={deal.id} deal={deal} locale={locale} />
              ))}
            </div>
            <div className="mt-12">
              <DealPagination total={total} pageSize={pageSize} currentPage={currentPage} />
            </div>
          </>
        ) : (
          <div className="card-elevated p-12">
            <EmptyState
              icon="bag"
              title={t('emptyTitle')}
              description={t('emptyDescription')}
            />
          </div>
        )}
      </section>
      </main>
    </>
  );
}

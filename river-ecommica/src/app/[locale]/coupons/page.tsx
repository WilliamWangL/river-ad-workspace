import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchCoupons } from '@/lib/api';
import { getCurrentRegion } from '@/lib/region';
import { getRegionFilter } from '@/lib/region-constants';
import { PAGINATION } from '@/constants/pagination';
import CouponCard from '@/components/coupon/CouponCard';
import CouponsToolbar from '@/components/coupon/CouponsToolbar';
import { CouponPagination } from '@/components/coupon/CouponPagination';
import { EmptyState } from '@/components/ui/empty-state';
import { JsonLd, BASE_URL, generateBreadcrumbJsonLd, generateItemListJsonLd } from '@/components/seo/JsonLd';
import {
  Ticket,
  BadgeCheck,
  Timer,
  Scissors,
  Copy
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'coupons' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/coupons`,
      languages: {
        'en': `${BASE_URL}/en/coupons`,
        'zh': `${BASE_URL}/zh/coupons`,
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `${BASE_URL}/${locale}/coupons`,
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

export default async function CouponsPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const searchParams = await props.searchParams;

  const t = await getTranslations({ locale, namespace: 'coupons' });

  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const verifiedOnly = searchParams.verified === 'true';
  const currentPage = parseInt(typeof searchParams.page === 'string' ? searchParams.page : String(PAGINATION.DEFAULT_PAGE), 10);
  const pageSize = PAGINATION.PAGE_SIZE.COUPON;
  const region = await getCurrentRegion({ region: typeof searchParams.region === 'string' ? searchParams.region : undefined });

  const regionFilter = getRegionFilter(region);
  const regionsArray = regionFilter ? [regionFilter] : undefined;

  const { list: allCoupons, total } = await fetchCoupons({
    pageNo: currentPage,
    pageSize,
    verified: verifiedOnly ? true : undefined,
    regions: regionsArray
  });

  const displayCoupons = q
    ? allCoupons.filter(c =>
        c.code.toLowerCase().includes(q.toLowerCase()) ||
        c.merchant?.name?.toLowerCase().includes(q.toLowerCase()) ||
        c.description?.toLowerCase().includes(q.toLowerCase())
      )
    : allCoupons;

  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  // Fetch all coupons for stats (without pagination)
  const allCouponsResult = await fetchCoupons({ verified: verifiedOnly ? true : undefined, regions: regionsArray });
  const allCouponsForStats = allCouponsResult.list;
  const totalCoupons = total;
  const verifiedCount = allCouponsForStats.filter(c => c.verified).length;

  const expiringCount = allCouponsForStats.filter(c => {
    if (!c.endTime) return false;
    const end = new Date(c.endTime);
    return end > now && end <= threeDaysFromNow;
  }).length;

  const breadcrumbJsonLdItems = [
    { name: 'Home', url: `${BASE_URL}/${locale}` },
    { name: 'Coupons', url: `${BASE_URL}/${locale}/coupons` },
  ];
  const itemListJsonLdItems = displayCoupons
    .filter(coupon => coupon.id)
    .map(coupon => ({
      name: `${coupon.merchant?.name || 'Store'} - ${coupon.title || coupon.description}`,
      url: `${BASE_URL}/${locale}/coupons#coupon-${coupon.id}`
    }));

  return (
    <>
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />
      {itemListJsonLdItems.length > 0 && (
        <JsonLd data={generateItemListJsonLd(itemListJsonLdItems, 'Coupons')} />
      )}
      <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden section-gradient border-b border-border/50">
        <div className="absolute inset-0 bg-dots-pattern opacity-50" />

        <div className="container mx-auto px-4 py-10 md:py-14 relative">
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-card rounded-3xl shadow-xl shadow-primary/5 border border-border overflow-hidden">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-background rounded-full border-r border-border" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-background rounded-full border-l border-border" />

              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-8 md:p-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-100/50 text-emerald-600">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <span className="text-emerald-600 font-bold text-sm tracking-wide">{t('badgeCouponCodes')}</span>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight mb-4">
                    {t('heroTitle1')}
                    <span className="text-gradient-savings block mt-1">{t('heroTitle2')}</span>
                  </h1>

                  <p className="text-muted-foreground text-lg max-w-lg leading-relaxed">
                    {t('heroDescription')}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm font-medium border border-border/50">
                    <Copy className="w-4 h-4" />
                    <span>{t('clickToCopy')}</span>
                  </div>
                </div>

                <div className="relative md:border-l border-dashed border-border p-8 md:p-10 bg-muted/10 flex flex-col justify-center min-w-[280px]">
                  <div className="md:hidden absolute top-0 left-8 right-8 border-t border-dashed border-border" />

                  <div className="space-y-6">
                    <div className="flex items-center justify-between md:justify-start md:gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                        <Ticket className="w-4 h-4" />
                        <span>{t('statTotal')}</span>
                      </div>
                      <span className="text-2xl font-bold font-display text-foreground">
                        {totalCoupons}
                      </span>
                    </div>

                    <div className="flex items-center justify-between md:justify-start md:gap-4">
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                        <BadgeCheck className="w-4 h-4" />
                        <span>{t('statVerified')}</span>
                      </div>
                      <span className="text-2xl font-bold font-display text-emerald-600">
                        {verifiedCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between md:justify-start md:gap-4">
                      <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                        <Timer className="w-4 h-4" />
                        <span>{t('statExpiring')}</span>
                      </div>
                      <span className="text-2xl font-bold font-display text-amber-600">
                        {expiringCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CouponsToolbar />

      <section className="container mx-auto px-4 py-8 md:py-12">
        {displayCoupons.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {displayCoupons.map(coupon => (
                <CouponCard key={coupon.id} coupon={coupon} locale={locale} />
              ))}
            </div>
            <div className="mt-12">
              <CouponPagination total={total} pageSize={pageSize} currentPage={currentPage} />
            </div>
          </>
        ) : (
          <div className="card-elevated p-12">
            <EmptyState
              icon="ticket"
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

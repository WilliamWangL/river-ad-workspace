import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchStores, fetchStoreBySlug, fetchDeals, fetchOffersByMerchant } from '@/lib/api';
import { getTrackingLink } from '@/lib/tracking';
import { stripHtml } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/blog';
import DealCard from '@/components/deal/DealCard';
import OfferCard from '@/components/offer/OfferCard';
import { Badge } from '@/components/ui/badge';
import { JsonLd, BASE_URL, generateStoreJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Star, ShoppingBag, Ticket, ShieldCheck, Store as StoreIcon, ArrowUpRight, Gift } from 'lucide-react';

// 使用 ISR，每 5 分钟重新生成
export const revalidate = 300;
export const dynamicParams = true;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const { list: stores } = await fetchStores();
    const locales = ['en', 'zh'];

    return locales.flatMap(locale =>
      stores
        .filter(store => store.slug && typeof store.slug === 'string')
        .map(store => ({
          locale,
          slug: store.slug,
        }))
    );
  } catch {
    // 构建时 API 不可用，返回空数组，页面将在运行时动态渲染
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'StoreDetail' });
  const store = await fetchStoreBySlug(slug);

  if (!store) {
    return { title: t('meta.notFound') };
  }

  const ogImage = store.logoUrl || '/og-image.png';

  return {
    title: t('meta.title', { name: store.name }),
    description: store.description ? stripHtml(store.description, 160) : t('meta.description', { name: store.name }),
    alternates: {
      canonical: `${BASE_URL}/${locale}/stores/${store.slug}`,
      languages: {
        'en': `${BASE_URL}/en/stores/${store.slug}`,
        'zh': `${BASE_URL}/zh/stores/${store.slug}`,
      },
    },
    openGraph: {
      title: t('meta.title', { name: store.name }),
      description: store.description ? stripHtml(store.description, 160) : t('meta.description', { name: store.name }),
      url: `${BASE_URL}/${locale}/stores/${store.slug}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: store.name,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title', { name: store.name }),
      description: store.description ? stripHtml(store.description, 160) : t('meta.description', { name: store.name }),
      images: [ogImage],
    },
  };
}

export default async function StoreDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'StoreDetail' });
  const store = await fetchStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  // 并行获取 deals 和 offers
  const [{ list: deals }, offers] = await Promise.all([
    fetchDeals({ merchantId: store.id }),
    fetchOffersByMerchant(store.id),
  ]);

  // 获取第一个可用的 Offer（用于 Visit Store 按钮）
  const firstOffer = offers.length > 0 ? offers[0] : null;
  // Visit Store URL：有可用 Offer 使用其 tracking link，否则跳转商家官网
  const visitStoreUrl = firstOffer?.trackingLinkId
    ? getTrackingLink(firstOffer.trackingLinkId, firstOffer.trackingUrl)
    : `https://${store.domain}`;

  const breadcrumbs = [
    { label: t('breadcrumbHome'), href: '/' },
    { label: t('breadcrumbStores'), href: '/stores' },
    { label: store.name, href: `/stores/${store.slug}` }
  ];

  const breadcrumbJsonLdItems = breadcrumbs.map(item => ({
    name: item.label,
    url: `${BASE_URL}/${locale}${item.href}`
  }));

  return (
    <>
      <JsonLd data={generateStoreJsonLd(store)} />
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />
      <Breadcrumbs items={breadcrumbs} />
      
      <main className="min-h-screen pb-12">
        <div className="page-header py-12 mb-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 max-w-5xl mx-auto">
              
              <div className="card-elevated p-4 bg-white shrink-0 relative group">
                <div className="w-32 h-32 relative flex items-center justify-center">
                  {store.logoUrl ? (
                    <Image 
                      src={store.logoUrl} 
                      alt={store.name} 
                      fill 
                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105" 
                    />
                  ) : (
                    <StoreIcon size={48} className="text-gray-300" />
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap">
                  <ShieldCheck size={12} /> {t('verified')}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h1 className="text-4xl font-bold font-display text-foreground mb-2">{store.name}</h1>
                  {store.description && (
                    <p className="text-lg text-muted-foreground max-w-2xl line-clamp-3">{stripHtml(store.description)}</p>
                  )}
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                  <div className="stat-card min-w-[120px]">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <ShoppingBag size={16} />
                      <span className="stat-label">{t('statDeals')}</span>
                    </div>
                    <span className="stat-value">{store.dealCount}</span>
                  </div>

                  <div className="stat-card min-w-[120px]">
                    <div className="flex items-center gap-2 text-orange-500 mb-1">
                      <Ticket size={16} />
                      <span className="stat-label">{t('statCoupons')}</span>
                    </div>
                    <span className="stat-value">{store.couponCount}</span>
                  </div>

                  {store.rating && (
                    <div className="stat-card min-w-[120px]">
                      <div className="flex items-center gap-2 text-yellow-500 mb-1">
                        <Star size={16} />
                        <span className="stat-label">{t('statRating')}</span>
                      </div>
                      <span className="stat-value">{store.rating}</span>
                    </div>
                  )}
                </div>

                {/* Visit Store Button - 使用原生 <a> 标签避免 Next.js Link 的 prefetch 行为 */}
                <div className="flex justify-center md:justify-start mt-6">
                  <a
                    href={visitStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{t('visitStore')}</span>
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 关于商家 - 富文本简介 */}
        {store.description && (
          <section className="container mx-auto px-4 max-w-4xl py-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100">
                <StoreIcon className="w-5 h-5 text-cyan-600" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                {t('aboutStore', { name: store.name })}
              </h2>
            </div>
            <MarkdownRenderer content={store.description} className="prose prose-lg prose-slate max-w-none" />
          </section>
        )}

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              <span className="w-1 h-8 bg-primary rounded-full block"></span>
              {t('sectionTitle')}
            </h2>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {t('offersAvailable', { count: deals.length })}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deals.length > 0 ? deals.map(deal => (
              <DealCard key={deal.id} deal={deal} locale={locale} />
            )) : (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('emptyTitle')}</h3>
                <p className="text-gray-500">{t('emptyDescription', { name: store.name })}</p>
              </div>
            )}
          </div>

          {/* Offers Section */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              <span className="w-1 h-8 bg-emerald-500 rounded-full block"></span>
              {t('offersSectionTitle')}
            </h2>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {t('offersCount', { count: offers.length })}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.length > 0 ? offers.map(offer => (
              <OfferCard key={offer.id} offer={offer} />
            )) : (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('emptyOffersTitle')}</h3>
                <p className="text-gray-500">{t('emptyOffersDescription')}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

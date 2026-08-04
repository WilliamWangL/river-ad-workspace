import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchDeals, fetchDealBySlug } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { JsonLd, BASE_URL, generateDealJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CheckCircle, Clock, ShieldCheck, ExternalLink, Store, Tag } from 'lucide-react';
import { getTrackingLink } from '@/lib/tracking';

// 使用 ISR，每 5 分钟重新生成
export const revalidate = 300;
export const dynamicParams = true;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const { list: deals } = await fetchDeals();
    const locales = ['en', 'zh'];

    return locales.flatMap(locale =>
      deals
        .filter(deal => deal.slug && typeof deal.slug === 'string')
        .map(deal => ({
          locale,
          slug: deal.slug,
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
  const t = await getTranslations({ locale, namespace: 'DealDetail' });
  const deal = await fetchDealBySlug(slug);

  if (!deal) {
    return { title: t('meta.notFound') };
  }

  // SEO: metaTitle 优先，为空回退默认标题；metaDescription 优先，为空回退 description
  const pageTitle = deal.metaTitle || `${deal.title} - ${deal.merchant.name}`;
  const pageDescription = deal.metaDescription || deal.description || t('meta.description', { percent: deal.discountPercent, store: deal.merchant.name });
  const ogImage = deal.imageUrl || '/og-image.png';

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: `${BASE_URL}/${locale}/deals/${deal.slug}`,
      languages: {
        'en': `${BASE_URL}/en/deals/${deal.slug}`,
        'zh': `${BASE_URL}/zh/deals/${deal.slug}`,
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${BASE_URL}/${locale}/deals/${deal.slug}`,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: deal.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
  };
}

export default async function DealDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'DealDetail' });
  const deal = await fetchDealBySlug(slug);

  if (!deal) {
    notFound();
  }

  const trackingUrl = getTrackingLink(deal.trackingLinkId, deal.gotoUrl);

  const breadcrumbs = [
    { label: t('breadcrumbHome'), href: '/' },
    { label: t('breadcrumbDeals'), href: '/deals' },
    { label: deal.title, href: `/deals/${deal.slug}` }
  ];

  const breadcrumbJsonLdItems = breadcrumbs.map(item => ({
    name: item.label,
    url: `${BASE_URL}/${locale}${item.href}`
  }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />
      <JsonLd data={generateDealJsonLd(deal)} />
      
      <main className="min-h-screen pb-12">
        <div className="section-gradient pt-8 pb-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-5">
                <div className="card-elevated overflow-hidden p-2 bg-white relative group">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-50">
                    {deal.imageUrl ? (
                      <Image
                        src={deal.imageUrl}
                        alt={deal.title}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Tag size={64} />
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {deal.featured && <span className="badge-featured shadow-lg">{t('badgeFeatured')}</span>}
                      {deal.discountPercent > 0 && (
                        <span className="badge-deal shadow-lg">-{deal.discountPercent}%</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-white/60 shadow-sm">
                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{t('verified')}</p>
                      <p className="text-sm font-bold text-foreground">{t('trustedDeal')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-white/60 shadow-sm">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{t('updated')}</p>
                      <p className="text-sm font-bold text-foreground">{t('today')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div>
                  <Link 
                    href={`/${locale}/stores/${deal.merchant.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-3 group"
                  >
                    <Store size={16} className="group-hover:text-primary" />
                    {deal.merchant.name}
                  </Link>
                  
                  <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground mb-4 leading-tight">
                    {deal.title}
                  </h1>

                  {(deal.originalPrice > 0 || deal.dealPrice > 0) && (
                    <div className="flex items-baseline gap-3 mb-6">
                      {deal.dealPrice > 0 && (
                        <span className="text-4xl font-bold text-gradient-savings">
                          ${deal.dealPrice}
                        </span>
                      )}
                      {deal.originalPrice > 0 && (
                        <span className="text-xl text-muted-foreground line-through decoration-2 decoration-red-200">
                          ${deal.originalPrice}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg" className="btn-accent w-full text-lg h-14 glow-accent group relative overflow-hidden">
                      <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {t('getThisDeal')} <ExternalLink size={20} />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      </a>
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-green-500" /> {t('verifiedWorking')}
                    </span>
                    {deal.endTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-orange-500" />
                        {t('expires', { date: new Date(deal.endTime).toLocaleDateString() })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="prose prose-gray max-w-none">
                  <h3 className="text-lg font-bold font-display mb-2">{t('aboutThisDeal')}</h3>
                  <p className="text-gray-600 leading-relaxed">{deal.description}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 border border-gray-100">
                  <p className="font-medium mb-1 text-gray-700">{t('termsTitle')}</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('termSupplies')}</li>
                    <li>{t('termPrices')}</li>
                    <li>{t('termDetails')}</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

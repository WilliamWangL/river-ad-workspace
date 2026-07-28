import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchCategories } from '@/lib/api';
import { getCurrentRegion } from '@/lib/region';
import { getRegionFilter } from '@/lib/region-constants';
import { CategorySection } from '@/components/home/CategorySection';
import { JsonLd, BASE_URL, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import {
  Compass,
  Layers,
  Tag
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'categories' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/categories`,
      languages: {
        'en': `${BASE_URL}/en/categories`,
        'zh': `${BASE_URL}/zh/categories`,
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `${BASE_URL}/${locale}/categories`,
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

export default async function CategoriesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ region?: string }>
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const queryParams = await searchParams;
  const region = await getCurrentRegion(queryParams);
  const t = await getTranslations({ locale, namespace: 'categories' });

  const regionFilter = getRegionFilter(region);
  const categories = await fetchCategories({ region: regionFilter });

  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((acc, c) => acc + (c.children?.length || 0), 0);

  const breadcrumbJsonLdItems = [
    { name: 'Home', url: `${BASE_URL}/${locale}` },
    { name: 'Categories', url: `${BASE_URL}/${locale}/categories` },
  ];

  return (
    <>
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden section-gradient border-b border-border/50">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-8 left-[10%] w-16 h-16 rounded-2xl bg-card shadow-lg border border-border rotate-12 opacity-60" />
            <div className="absolute top-20 right-[15%] w-12 h-12 rounded-xl bg-card shadow-md border border-border -rotate-6 opacity-50" />
            <div className="absolute bottom-12 left-[20%] w-14 h-14 rounded-2xl bg-card shadow-lg border border-border rotate-6 opacity-40" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16 relative">
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Compass className="w-4 h-4" />
                <span>{t('breadcrumbExplore')}</span>
                <span className="text-primary/40">/</span>
                <span className="text-primary font-medium">{t('breadcrumbCategories')}</span>
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
                {t('heroDescription')}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="stat-card min-w-[120px]">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>{t('statCategories')}</span>
                  </div>
                  <span className="stat-value">{totalCategories}</span>
                </div>

                <div className="stat-card min-w-[120px]">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span>{t('statSubcategories')}</span>
                  </div>
                  <span className="stat-value">{totalSubcategories}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid - 显示全部分类，不受默认 maxCategories=8 限制 */}
        {categories.length > 0 ? (
          <CategorySection categories={categories} locale={locale} maxCategories={categories.length} />
        ) : (
          <section className="py-16 lg:py-20 bg-background">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mb-6">
                  <Layers className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  {t('emptyTitle')}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {t('emptyDescription')}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

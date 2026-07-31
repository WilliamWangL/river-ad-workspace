import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DealCard } from '@/components/deal/DealCard';
import { StoreCard } from '@/components/store/StoreCard';
import { CategorySection } from '@/components/home/CategorySection';
import { fetchDeals, fetchStores, fetchCategories } from '@/lib/api';
import { getCurrentRegion } from '@/lib/region';
import { getRegionFilter } from '@/lib/region-constants';
import { Button } from '@/components/ui/button';
import { HeroSearchForm } from '@/components/home/HeroSearchForm';
import Link from 'next/link';
import {
  Tag,
  Store,
  TrendingUp,
  ArrowRight,
  Zap,
  ShieldCheck,
  Sparkles,
  BadgePercent,
  Gift,
  Clock,
  ChevronRight,
  Star,
  Users
} from 'lucide-react';
import { JsonLd, generateWebSiteJsonLd, BASE_URL } from '@/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'Home'});

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        'en': `${BASE_URL}/en`,
        'zh': `${BASE_URL}/zh`,
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `${BASE_URL}/${locale}`,
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

export default async function HomePage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{ region?: string }>
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const queryParams = await searchParams;
  const region = await getCurrentRegion(queryParams);
  const t = await getTranslations({locale, namespace: 'Home'});
  const tCommon = await getTranslations({locale, namespace: 'Common'});
  const tCategories = await getTranslations({locale, namespace: 'categories'});

  const regionFilter = getRegionFilter(region);
  const regionsArray = regionFilter ? [regionFilter] : undefined;

  const [dealsResult, storesResult, categories] = await Promise.all([
    fetchDeals({ featured: true, regions: regionsArray }),
    fetchStores({ pageNo: 1, pageSize: 6, regions: regionsArray }),
    fetchCategories({ region: regionFilter })
  ]);

  const featuredDealsRaw = dealsResult.list.length > 0 ? dealsResult.list : (await fetchDeals({ regions: regionsArray })).list;
  const featuredDeals = featuredDealsRaw.slice(0, 8);
  const popularStores = storesResult.list.slice(0, 6);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <JsonLd data={generateWebSiteJsonLd()} />
      
      {/* ============================================
          HERO SECTION - Warm Honey Theme
          ============================================ */}
      <section className="relative overflow-hidden bg-background">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.6]" />
        
        {/* Ambient Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[100px]" />
        </div>

        <div className="container relative mx-auto px-4 pt-16 pb-16 lg:pt-24 lg:pb-20">
          <div className="mx-auto max-w-4xl flex flex-col items-center text-center">
            
            {/* Trust Badge */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-primary/20 shadow-lg shadow-primary/5 mb-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {t('trustedBy')} <span className="text-foreground font-bold">50,000+</span> {t('shoppers')}
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              <span className="text-foreground">{t('heroHeadline1')}</span>
              <br />
              <span className="text-gradient-primary">
                {t('heroHeadline2')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              {t('heroSubtitle')}
            </p>

            {/* Search Form */}
            <div className="w-full max-w-2xl mb-16 animate-in fade-in zoom-in-95 duration-700 delay-500">
              <HeroSearchForm
                placeholder={tCommon('searchPlaceholder')}
                buttonText={tCommon('search')}
              />
            </div>

            {/* Trust Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
              <div className="stat-card group hover:border-primary/30 transition-colors">
                <div className="mb-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="stat-value">100%</div>
                <div className="stat-label">{t('statVerifiedCodes')}</div>
              </div>

              <div className="stat-card group hover:border-primary/30 transition-colors">
                <div className="mb-2 p-2 rounded-lg bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="stat-value">{t('statFreshUpdates')}</div>
                <div className="stat-label">{t('statFreshUpdatesLabel')}</div>
              </div>

              <div className="stat-card group hover:border-primary/30 transition-colors">
                <div className="mb-2 p-2 rounded-lg bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="stat-value">10k+</div>
                <div className="stat-label">{t('statPartnerStores')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CATEGORY SECTION
          ============================================ */}
      {categories.length > 0 ? (
        <CategorySection categories={categories} locale={locale} showViewAll />
      ) : (
        <section className="py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="flex items-end justify-between mb-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  {tCategories('badge')}
                </div>
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                  {tCategories('sectionTitle')}
                </h2>
              </div>
            </div>
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-16 text-center card-elevated rounded-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                <Tag className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">{tCategories('emptyShort')}</p>
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          FEATURED DEALS
          ============================================ */}
      <section className="py-12 lg:py-16 section-gradient">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-4">
              <div className="badge-deal">
                <Zap className="w-3.5 h-3.5 fill-current" />
                {t('badgeHotDeals')}
              </div>
              <div>
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                  {t('featuredDeals')}
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl">
                  {t('featuredDealsSubtitle')}
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/deals`}
              className="group hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-200 hover-underline"
            >
              {tCommon('viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Deals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredDeals.length > 0 ? featuredDeals.map((deal, index) => (
              <div
                key={deal.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <DealCard deal={deal} locale={locale} />
              </div>
            )) : (
              <div className="col-span-full py-20 text-center card-elevated">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                  <Tag className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">{t('noDealsFound')}</p>
              </div>
            )}
          </div>

          {/* Mobile CTA */}
          <div className="mt-12 text-center md:hidden">
            <Button asChild className="btn-primary w-full sm:w-auto">
              <Link href={`/${locale}/deals`}>
                {tCommon('viewAll')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================
          POPULAR STORES
          ============================================ */}
      <section className="py-12 lg:py-16 bg-background relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-dots-pattern opacity-30" />
        
        <div className="container relative mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-4">
              <div className="badge-exclusive">
                <Store className="w-3.5 h-3.5" />
                {t('badgeTopBrands')}
              </div>
              <div>
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                  {t('popularStores')}
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl">
                  {t('popularStoresSubtitle')}
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/stores`}
              className="group hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-200 hover-underline"
            >
              {tCommon('viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {popularStores.map((store, index) => (
              <div
                key={store.id}
                className="animate-in fade-in zoom-in-95"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <StoreCard store={store} locale={locale} />
              </div>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-12 text-center md:hidden">
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl h-12">
              <Link href={`/${locale}/stores`}>
                {tCommon('viewAll')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION
          ============================================ */}
      <section className="py-12 lg:py-16 section-gradient">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="badge-featured mb-6 mx-auto">
              <Sparkles className="w-3.5 h-3.5" />
              {t('whyBadge')}
            </div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              {t('whyTitle')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('whySubtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BadgePercent,
                title: t('features.verified.title'),
                description: t('features.verified.description'),
                color: 'text-emerald-600',
                bg: 'bg-emerald-100 dark:bg-emerald-900/30'
              },
              {
                icon: Gift,
                title: t('features.exclusive.title'),
                description: t('features.exclusive.description'),
                color: 'text-violet-600',
                bg: 'bg-violet-100 dark:bg-violet-900/30'
              },
              {
                icon: Clock,
                title: t('features.realtime.title'),
                description: t('features.realtime.description'),
                color: 'text-amber-600',
                bg: 'bg-amber-100 dark:bg-amber-900/30'
              }
            ].map(({ icon: Icon, title, description, color, bg }, index) => (
              <div
                key={title}
                className="card-interactive p-8 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl ${bg} ${color} mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-bold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10 mix-blend-overlay" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            {/* Icon */}
            <div className="inline-flex p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-8 shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              {t('ctaTitle')}
            </h2>

            {/* Description */}
            <p className="text-white/90 text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
              {t('ctaSubtitle')}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-bold px-10 h-14 text-lg rounded-xl shadow-2xl shadow-black/10 hover:shadow-white/20 hover:-translate-y-1 transition-all"
                asChild
              >
                <Link href={`/${locale}/deals`}>
                  {t('ctaBrowseDeals')}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-black/20 border-2 border-white/30 text-white hover:bg-black/30 hover:border-white/50 font-bold px-10 h-14 text-lg rounded-xl backdrop-blur-sm hover:-translate-y-1 transition-all"
                asChild
              >
                <Link href={`/${locale}/coupons`}>
                  {t('ctaGetCoupons')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

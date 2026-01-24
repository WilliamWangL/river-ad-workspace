import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchStoreBySlug, fetchDeals } from '@/lib/api';
import DealCard from '@/components/deal/DealCard';
import { JsonLd, generateStoreJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  Star,
  Tag,
  ArrowRight,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  BadgeCheck,
  Sparkles,
  ChevronRight,
  Store
} from 'lucide-react';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await fetchStoreBySlug(slug);

  if (!store) {
    return { title: 'Store Not Found' };
  }

  return {
    title: `${store.name} Deals & Coupons${store.dealCount > 0 ? ` - ${store.dealCount} Active Deals` : ''} | Ecommica`,
    description: store.description || `Find the best deals and coupons for ${store.name}. ${store.dealCount} deals and ${store.couponCount} coupons available. Shop now and save!`,
    openGraph: {
      title: `${store.name} - Best Deals & Coupons`,
      description: store.description || `Find the best deals and coupons for ${store.name}`,
      images: store.logoUrl ? [store.logoUrl] : [],
    },
  };
}

export default async function StoreDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const store = await fetchStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  const { list: deals } = await fetchDeals({ merchantId: store.id });
  const activeDeals = deals.filter(d => !d.endTime || new Date(d.endTime) > new Date());
  const trackingUrl = store.trackingLinkId ? `/api/go/${store.trackingLinkId}` : (store.domain ? `https://${store.domain}` : '#');

  const breadcrumbs = [
    { label: 'Home', href: `/${locale}` },
    { label: 'Stores', href: `/${locale}/stores` },
    { label: store.name, href: `/${locale}/stores/${store.slug}` }
  ];

  const breadcrumbJsonLdItems = breadcrumbs.map(item => ({
    name: item.label,
    url: item.href
  }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={generateStoreJsonLd(store)} />
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />

      {/* ============================================
          HERO SECTION - Editorial Brand Showcase
          ============================================ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        {/* Layered Background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/95 to-slate-900" />

          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }} />

          {/* Radial spotlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />

          {/* Accent glow */}
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]" />

          {/* Subtle grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <div className="container mx-auto px-4 py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-[1fr,auto] gap-12 lg:gap-20 items-center">
            {/* Left Column - Brand Identity */}
            <div className="space-y-8">
              {/* Brand Header */}
              <div className="flex items-start gap-6 lg:gap-8">
                {/* Logo Container - Premium treatment */}
                <div className="relative shrink-0">
                  {/* Outer glow ring */}
                  <div className="absolute -inset-3 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl blur-xl" />

                  {/* Logo frame */}
                  <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-2xl lg:rounded-3xl bg-white/[0.07] backdrop-blur-xl border border-white/10 p-3 lg:p-4 shadow-2xl">
                    {store.logoUrl ? (
                      <Image
                        src={store.logoUrl}
                        alt={store.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl lg:text-5xl font-display font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                          {store.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Verified badge */}
                  <div className="absolute -bottom-2 -right-2 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-4 border-slate-950 shadow-lg shadow-emerald-500/30">
                    <BadgeCheck className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Brand Name & Trust */}
                <div className="pt-2 lg:pt-3 space-y-3">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white">
                    {store.name}
                  </h1>

                  {/* Trust indicators */}
                  <div className="flex items-center gap-4">
                    {store.rating && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(store.rating!) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-white/90">{store.rating}</span>
                      </div>
                    )}
                    {store.domain && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-300">{store.domain}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {store.description && (
                <p className="text-lg lg:text-xl text-slate-300/90 leading-relaxed max-w-2xl">
                  {store.description}
                </p>
              )}

              {/* Stats Row - Refined design */}
              <div className="flex flex-wrap gap-3">
                <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-display font-bold text-white">{store.dealCount}</span>
                    <span className="text-xs font-medium text-amber-400/80 uppercase tracking-wider">Active Deals</span>
                  </div>
                </div>

                <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-violet-500/20">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-display font-bold text-white">{store.couponCount}</span>
                    <span className="text-xs font-medium text-violet-400/80 uppercase tracking-wider">Coupons</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - CTA Card */}
            <div className="lg:w-80">
              <div className="relative p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-tr-3xl rounded-bl-[100px]" />

                <div className="relative space-y-5">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Official Store</span>
                    <h3 className="text-xl font-display font-bold text-white">
                      Shop {store.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Visit the official store to browse all products and exclusive offers.
                    </p>
                  </div>

                  {/* CTA Button - Premium gradient */}
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl overflow-hidden font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/20"
                  >
                    {/* Button background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <span className="relative flex items-center gap-2.5">
                      <ExternalLink className="w-5 h-5" />
                      Visit Store
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </a>

                  {/* Trust note */}
                  <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Shield className="w-3.5 h-3.5" />
                    We may earn a commission
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom curve transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 60V30C360 0 720 0 1080 10C1260 20 1380 35 1440 40V60H0Z" className="fill-slate-900"/>
          </svg>
        </div>
      </section>

      {/* ============================================
          ACTIVE DEALS SECTION
          ============================================ */}
      <section className="py-16 lg:py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-amber-400 uppercase tracking-widest">
                  Hot Deals
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white">
                Active Deals
                <span className="ml-3 inline-flex items-center justify-center px-3 py-1 text-lg font-bold bg-slate-800 text-amber-400 rounded-full border border-slate-700">
                  {activeDeals.length}
                </span>
              </h2>
              <p className="text-slate-400 text-lg">
                Handpicked savings from <span className="text-white font-medium">{store.name}</span>
              </p>
            </div>

            {activeDeals.length > 4 && (
              <Link
                href={`/${locale}/deals?merchantId=${store.id}`}
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-semibold transition-all duration-300"
              >
                View All Deals
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {/* Deals Grid or Empty State */}
          {activeDeals.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
                {activeDeals.slice(0, 8).map((deal, index) => (
                  <div
                    key={deal.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  >
                    <DealCard deal={deal} />
                  </div>
                ))}
              </div>

              {activeDeals.length > 8 && (
                <div className="mt-14 text-center">
                  <Link
                    href={`/${locale}/deals?merchantId=${store.id}`}
                    className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-800/80 hover:from-slate-700 hover:to-slate-700/80 border border-slate-700 hover:border-slate-600 text-white font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    View All {activeDeals.length} Deals
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            /* Empty State - Editorial Design */
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 p-16 text-center">
              {/* Background decoration */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-slate-700/20 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
              </div>

              <div className="relative space-y-6">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700">
                  <Tag className="w-10 h-10 text-slate-500" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-bold text-white">No Active Deals</h3>
                  <p className="text-slate-400 max-w-md mx-auto text-lg">
                    Check back soon for exclusive offers from <span className="text-white font-medium">{store.name}</span>
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href={`/${locale}/deals`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white font-semibold transition-all"
                >
                  Browse All Deals
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          ABOUT SECTION
          ============================================ */}
      {store.description && (
        <section className="py-16 bg-slate-950 border-t border-slate-800/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto lg:mx-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Store className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">
                  About {store.name}
                </h2>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed">
                {store.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          EXPLORE MORE SECTION
          ============================================ */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-slate-300">Discover More</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white">
              Explore More Stores
            </h2>
            <p className="text-slate-400 text-lg">
              Find deals from thousands of top brands
            </p>

            <Link
              href={`/${locale}/stores`}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-white/10"
            >
              Browse All Stores
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

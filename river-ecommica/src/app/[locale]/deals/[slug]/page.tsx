import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchDealBySlug } from '@/lib/api';
import { JsonLd, generateDealJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  ArrowRight,
  Tag,
  Clock,
  Shield,
  Zap,
  ArrowUpRight,
  Timer,
  BadgeCheck,
  Sparkles,
  TrendingDown,
  Store,
  ChevronRight
} from 'lucide-react';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const deal = await fetchDealBySlug(slug);

  if (!deal) {
    return { title: 'Deal Not Found' };
  }

  return {
    title: `${deal.title} - ${deal.discountPercent}% OFF at ${deal.merchant.name} | Ecommica`,
    description: deal.description || `Get ${deal.discountPercent}% off at ${deal.merchant.name}. ${deal.dealPrice ? `Only $${deal.dealPrice}.` : ''} Best deals and coupons from ${deal.merchant.name}.`,
    openGraph: {
      title: `${deal.title}`,
      description: deal.description || `Get ${deal.discountPercent}% off at ${deal.merchant.name}`,
      images: deal.imageUrl ? [deal.imageUrl] : [],
    },
  };
}

export default async function DealDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const deal = await fetchDealBySlug(slug);

  if (!deal) {
    notFound();
  }

  const trackingUrl = deal.trackingLinkId ? `/api/go/${deal.trackingLinkId}` : (deal.gotoUrl || '#');

  const breadcrumbs = [
    { label: 'Home', href: `/${locale}` },
    { label: 'Deals', href: `/${locale}/deals` },
    { label: deal.title, href: `/${locale}/deals/${deal.slug || deal.id}` }
  ];

  const breadcrumbJsonLdItems = breadcrumbs.map(item => ({
    name: item.label,
    url: item.href
  }));

  // Calculate savings
  const hasDiscount = deal.discountPercent > 0;
  const hasPrice = deal.originalPrice > 0 || deal.dealPrice > 0;
  const savings = hasDiscount && deal.originalPrice && deal.originalPrice > 0
    ? deal.originalPrice - deal.originalPrice * (deal.discountPercent / 100)
    : 0;

  // Check if deal is active
  const isActive = !deal.endTime || new Date(deal.endTime) > new Date();
  const hasEndTime = !!deal.endTime;

  // Determine urgency level for styling
  const getDiscountStyle = () => {
    if (deal.discountPercent >= 70) return {
      gradient: 'from-rose-500 via-pink-500 to-rose-600',
      shadow: 'shadow-rose-500/30',
      bg: 'from-rose-500/15 to-pink-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400'
    };
    if (deal.discountPercent >= 50) return {
      gradient: 'from-orange-500 via-red-500 to-rose-500',
      shadow: 'shadow-orange-500/30',
      bg: 'from-orange-500/15 to-red-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400'
    };
    if (deal.discountPercent >= 30) return {
      gradient: 'from-amber-400 via-orange-500 to-amber-500',
      shadow: 'shadow-amber-500/30',
      bg: 'from-amber-500/15 to-orange-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400'
    };
    return {
      gradient: 'from-emerald-400 via-teal-500 to-emerald-500',
      shadow: 'shadow-emerald-500/30',
      bg: 'from-emerald-500/15 to-teal-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400'
    };
  };

  const discountStyle = getDiscountStyle();

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />
      <JsonLd data={generateDealJsonLd(deal)} />

      {/* ============================================
          HERO SECTION - Dramatic Deal Showcase
          ============================================ */}
      <section className="relative overflow-hidden">
        {/* Layered Background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }} />

          {/* Colored glows based on discount level */}
          <div className={`absolute top-0 left-1/3 w-[600px] h-[500px] bg-gradient-to-br ${discountStyle.bg} rounded-full blur-[120px] opacity-60`} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-slate-800/30 rounded-full blur-[100px]" />

          {/* Subtle animated grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="container mx-auto px-4 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column - Product Visual */}
            <div className="order-2 lg:order-1 space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2.5">
                {deal.featured && (
                  <span className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg shadow-amber-500/25">
                    <Sparkles className="w-4 h-4" />
                    Featured Deal
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full animate-ping" />
                  </span>
                )}
                {hasDiscount && (
                  <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r ${discountStyle.gradient} text-white text-sm font-bold shadow-lg ${discountStyle.shadow}`}>
                    <TrendingDown className="w-4 h-4" />
                    {deal.discountPercent}% OFF
                  </span>
                )}
                {isActive && hasEndTime && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-800 border border-orange-500/30 text-orange-400 text-sm font-bold">
                    <Timer className="w-4 h-4" />
                    Limited Time
                  </span>
                )}
              </div>

              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-800/50 border border-slate-700/50 shadow-2xl group">
                {deal.imageUrl ? (
                  <>
                    <Image
                      src={deal.imageUrl}
                      alt={deal.title}
                      fill
                      className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-2xl bg-slate-700/50 flex items-center justify-center">
                      <Tag className="w-16 h-16 text-slate-600" />
                    </div>
                  </div>
                )}

                {/* Merchant Badge - Bottom overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <Link
                    href={`/${locale}/stores/${deal.merchant.slug}`}
                    className="group/merchant inline-flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600 transition-all duration-300"
                  >
                    {deal.merchant.logoUrl ? (
                      <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-lg">
                        <Image
                          src={deal.merchant.logoUrl}
                          alt={deal.merchant.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
                        <Store className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Shop at</span>
                      <span className="text-base font-bold text-white group-hover/merchant:text-amber-400 transition-colors">
                        {deal.merchant.name}
                      </span>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-500 ml-auto group-hover/merchant:text-amber-400 group-hover/merchant:-translate-y-0.5 group-hover/merchant:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Deal Info & CTA */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-8">
              <div className="space-y-8">
                {/* Verified Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Verified Deal</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white leading-tight tracking-tight">
                  {deal.title}
                </h1>

                {/* Description */}
                {deal.description && (
                  <div className={`relative pl-6 border-l-4 ${discountStyle.border}`}>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      {deal.description}
                    </p>
                  </div>
                )}

                {/* Dramatic Price Display */}
                {hasPrice && (
                  <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                    <div className="flex flex-wrap items-end gap-4">
                      {deal.dealPrice > 0 && (
                        <div className="flex items-baseline gap-3">
                          <span className={`text-5xl md:text-6xl lg:text-7xl font-display font-black bg-gradient-to-r ${discountStyle.gradient} bg-clip-text text-transparent`}>
                            ${deal.dealPrice}
                          </span>
                          {deal.originalPrice > 0 && (
                            <span className="text-2xl md:text-3xl text-slate-500 line-through font-medium">
                              ${deal.originalPrice}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Savings Badge */}
                    {hasDiscount && deal.originalPrice > 0 && savings > 0 && (
                      <div className="mt-4 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
                        <TrendingDown className="w-5 h-5 text-emerald-400" />
                        <span className="text-lg font-bold text-emerald-400">
                          You save ${savings.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-3">
                  {deal.endTime && (
                    <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Expires</span>
                        <span className="text-sm font-semibold text-white">
                          {new Date(deal.endTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Status</span>
                      <span className="text-sm font-semibold text-white">Verified & Active</span>
                    </div>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="space-y-4 pt-4">
                  {/* Primary CTA */}
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative flex items-center justify-center gap-3 w-full py-5 px-8 rounded-2xl overflow-hidden font-bold text-lg text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${discountStyle.shadow}`}
                  >
                    {/* Button background */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${discountStyle.gradient}`} />

                    {/* Hover brightness overlay */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    {/* Content */}
                    <span className="relative flex items-center gap-3">
                      <Zap className="w-6 h-6" />
                      Get This Deal
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </a>

                  {/* Trust Message */}
                  <p className="flex items-center justify-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      No sign-up required
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span>Cancel anytime</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 40V20C480 0 960 0 1440 20V40H0Z" className="fill-slate-900"/>
          </svg>
        </div>
      </section>

      {/* ============================================
          DEAL TERMS SECTION
          ============================================ */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Tag className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white">
                Deal Terms & Conditions
              </h2>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Valid until the expiration date specified above</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Cannot be combined with other offers or promotions unless specified</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Subject to availability and merchant&apos;s terms of service</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                  <span className="text-slate-500">We may earn a commission on qualifying purchases</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MORE DEALS SECTION
          ============================================ */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-300">More Savings</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white">
              More Deals You&apos;ll Love
            </h2>
            <p className="text-slate-400 text-lg">
              Discover more exclusive offers from <span className="text-white font-medium">{deal.merchant.name}</span>
            </p>

            <Link
              href={`/${locale}/stores/${deal.merchant.slug}`}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-white/10"
            >
              View All {deal.merchant.name} Deals
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

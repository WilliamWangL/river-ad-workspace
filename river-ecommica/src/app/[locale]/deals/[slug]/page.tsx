import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchDealBySlug } from '@/lib/api';
import { JsonLd, generateDealJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ArrowRight, Tag, Clock, Shield, Zap, ExternalLink } from 'lucide-react';

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
  const daysLeft = deal.endTime
    ? Math.ceil((new Date(deal.endTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />
      <JsonLd data={generateDealJsonLd(deal)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0px,transparent_2px,#f59e0b_2px,#f59e0b_3px,transparent_3px)] bg-[length:100px_100%]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_0px,transparent_2px,#f59e0b_2px,#f59e0b_3px,transparent_3px)] bg-[length:100%_100px]" />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-16 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Image & Badges */}
            <div className="relative order-2 lg:order-1">
              {/* Badge Container */}
              <div className="flex flex-wrap gap-3 mb-6">
                {deal.featured && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-black text-sm font-bold uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    Featured
                  </span>
                )}
                {hasDiscount && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider animate-pulse">
                    <Tag className="w-4 h-4" />
                    {deal.discountPercent}% OFF
                  </span>
                )}
                {isActive && daysLeft !== null && daysLeft <= 3 && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-600 text-white text-sm font-bold uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    {daysLeft === 0 ? 'Expires Today' : `${daysLeft}d Left`}
                  </span>
                )}
              </div>

              {/* Deal Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-2xl shadow-black/50 group">
                {deal.imageUrl ? (
                  <>
                    <Image
                      src={deal.imageUrl}
                      alt={deal.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="text-4xl font-bold text-slate-500">
                        {deal.merchant.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Merchant Badge */}
                <div className="absolute bottom-4 left-4 right-4">
                  <Link
                    href={`/${locale}/stores/${deal.merchant.slug}`}
                    className="inline-flex items-center gap-3 bg-slate-950/90 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-colors group/merchant"
                  >
                    {deal.merchant.logoUrl ? (
                      <Image
                        src={deal.merchant.logoUrl}
                        alt={deal.merchant.name}
                        width={28}
                        height={28}
                        className="rounded-lg object-contain bg-white"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-300">
                          {deal.merchant.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Shop at</span>
                      <span className="text-sm font-semibold text-white group-hover/merchant:text-amber-400 transition-colors">
                        {deal.merchant.name}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover/merchant:text-amber-400 group-hover/merchant:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Content & CTA */}
            <div className="order-1 lg:order-2">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                <span className="block text-slate-400 text-lg md:text-xl font-normal mb-2 tracking-normal">
                  Exclusive Deal
                </span>
                {deal.title}
              </h1>

              {/* Description */}
              {deal.description && (
                <p className="text-lg text-slate-300 leading-relaxed mb-8 border-l-4 border-amber-500/50 pl-6">
                  {deal.description}
                </p>
              )}

              {/* Price Block */}
              <div className="flex items-baseline gap-4 mb-8">
                {hasPrice && (
                  <>
                    {deal.dealPrice > 0 && (
                      <span className="text-5xl md:text-6xl font-black text-amber-400">
                        ${deal.dealPrice}
                      </span>
                    )}
                    {deal.originalPrice > 0 && (
                      <span className="text-2xl text-slate-500 line-through">
                        ${deal.originalPrice}
                      </span>
                    )}
                    {hasDiscount && deal.originalPrice > 0 && savings > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-400 text-sm font-semibold rounded-full">
                        Save ${savings.toFixed(2)}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-8 text-sm">
                {deal.endTime && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-300">
                      Expires: {new Date(deal.endTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300">Verified Deal</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="space-y-4">
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-3 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-black text-lg font-bold uppercase tracking-wider rounded-xl overflow-hidden transition-all duration-300 hover:from-amber-400 hover:to-orange-500 hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <Zap className="w-5 h-5" />
                    Get This Deal
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </span>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </a>
                <p className="text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  No sign-up required • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deal Terms Section */}
      <section className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Tag className="w-6 h-6 text-amber-500" />
              Deal Terms & Conditions
            </h2>
            <div className="prose prose-invert prose-slate max-w-none">
              <ul className="space-y-2 text-slate-400">
                <li>• Valid until the expiration date specified above</li>
                <li>• Cannot be combined with other offers or promotions</li>
                <li>• Subject to availability and merchant's terms</li>
                <li>• We may earn a commission on qualifying purchases</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* More Deals Section */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              More Deals You&apos;ll Love
            </h2>
            <p className="text-slate-400">
              Discover other exclusive offers from {deal.merchant.name}
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              href={`/${locale}/stores/${deal.merchant.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-xl border border-slate-700 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
            >
              View All {deal.merchant.name} Deals
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

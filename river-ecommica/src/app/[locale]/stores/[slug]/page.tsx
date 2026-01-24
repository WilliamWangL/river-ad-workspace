import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchStoreBySlug, fetchDeals, fetchStores } from '@/lib/api';
import DealCard from '@/components/deal/DealCard';
import { JsonLd, generateStoreJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Star, Tag, Clock, ArrowRight, ExternalLink, Shield, Zap, TrendingUp } from 'lucide-react';

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
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbs)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#6366f1_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Gradient Accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-16 relative">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Store Logo & Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Logo */}
                <div className="relative shrink-0">
                  <div className="w-28 h-28 rounded-2xl bg-white p-4 shadow-2xl shadow-indigo-500/20 border border-slate-700">
                    {store.logoUrl ? (
                      <Image
                        src={store.logoUrl}
                        alt={store.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl">
                        <span className="text-4xl font-black text-white">
                          {store.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Verified Badge */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-slate-900">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                    {store.name}
                  </h1>
                  {store.description && (
                    <p className="text-lg text-slate-300 leading-relaxed mb-4">
                      {store.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-lg border border-slate-700">
                      <Tag className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-semibold">{store.dealCount}</span>
                      <span className="text-slate-400">deals</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-lg border border-slate-700">
                      <Zap className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-semibold">{store.couponCount}</span>
                      <span className="text-slate-400">coupons</span>
                    </div>
                    {store.rating && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-lg border border-slate-700">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-semibold">{store.rating}</span>
                        <span className="text-slate-400">rating</span>
                      </div>
                    )}
                    {store.domain && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-lg border border-slate-700">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-slate-300 text-sm truncate max-w-[150px]">{store.domain}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="w-full lg:w-auto lg:shrink-0">
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white text-lg font-bold uppercase tracking-wider rounded-xl overflow-hidden transition-all duration-300 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <ExternalLink className="w-5 h-5" />
                  Visit Store
                </span>
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </a>
              <p className="text-center text-slate-500 text-xs mt-3 flex items-center justify-center gap-2">
                <Shield className="w-3 h-3" />
                We may earn a commission
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Deals Section */}
      <section className="py-12 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400" />
                Active Deals
              </h2>
              <p className="text-slate-400 mt-1">
                {activeDeals.length} deals available from {store.name}
              </p>
            </div>
            {activeDeals.length > 4 && (
              <Link
                href={`/${locale}/deals?merchantId=${store.id}`}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 hover:border-indigo-500/50 transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {activeDeals.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeDeals.slice(0, 8).map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
              {activeDeals.length > 8 && (
                <div className="mt-10 text-center">
                  <Link
                    href={`/${locale}/deals?merchantId=${store.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-xl border border-slate-700 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
                  >
                    View All {activeDeals.length} Deals
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <Tag className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Active Deals</h3>
              <p className="text-slate-400">Check back later for new deals from {store.name}</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      {store.description && (
        <section className="py-12 bg-slate-950 border-t border-slate-800">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-indigo-400" />
                About {store.name}
              </h2>
              <p className="text-slate-300 leading-relaxed">
                {store.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* More Stores Section */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Explore More Stores
            </h2>
            <p className="text-slate-400">
              Discover deals from your favorite brands
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              href={`/${locale}/stores`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-xl border border-slate-700 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
            >
              Browse All Stores
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

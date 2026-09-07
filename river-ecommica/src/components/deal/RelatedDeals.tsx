import { Deal } from '@/types';
import { fetchDeals } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Tag } from 'lucide-react';
import { getTrackingUrl } from '@/lib/tracking';

interface RelatedDealsProps {
  categoryId?: number;
  currentDealId: number;
  locale: string;
}

/** Fisher-Yates shuffle (returns new array, does not mutate input) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function RelatedDeals({ categoryId, currentDealId, locale }: RelatedDealsProps) {
  const t = await getTranslations({ locale, namespace: 'DealDetail' });

  // Fetch more deals when we can filter by category
  const { list: allDeals } = await fetchDeals({
    categoryId,
    pageSize: categoryId ? 20 : 12,
  });

  // Exclude current deal, then shuffle and take 4
  const related = shuffle(allDeals.filter(d => d.id !== currentDealId)).slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-display text-foreground">
            {t('relatedDeals')}
          </h2>
          <Link
            href={`/${locale}/deals`}
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            {t('viewMore')} <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {related.map(deal => (
            <RelatedDealCard key={deal.id} deal={deal} locale={locale} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedDealCard({ deal, locale, t }: { deal: Deal; locale: string; t: (key: string, opts?: Record<string, unknown>) => string }) {
  const merchantName = deal.merchant?.name || 'Store';

  return (
    <article className="group relative bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
        {deal.imageUrl ? (
          <Image
            src={deal.imageUrl}
            alt={deal.title}
            fill
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <Tag size={32} />
          </div>
        )}
        {deal.discountPercent > 0 && (
          <span className="absolute top-2 right-2 bg-rose-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
            -{deal.discountPercent}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-muted-foreground font-medium mb-1 truncate">{merchantName}</p>
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors min-h-[2.5rem]">
          <Link href={`/${locale}/deals/${deal.slug}`}>{deal.title}</Link>
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {deal.dealPrice > 0 && (
              <span className="text-lg font-bold text-primary">${deal.dealPrice}</span>
            )}
            {deal.originalPrice > 0 && (
              <span className="text-xs text-muted-foreground line-through">${deal.originalPrice}</span>
            )}
          </div>
          <a
            href={getTrackingUrl('deal', deal.id, deal.gotoUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {t('getDeal')} <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
    </article>
  );
}

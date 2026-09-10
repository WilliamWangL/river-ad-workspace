'use client';

import { Deal } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Sparkles, Crown, ArrowUpRight, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTrackingUrl } from '@/lib/tracking';
import { CountdownTimer } from './CountdownTimer';

interface DealCardProps {
  deal: Deal;
  locale: string;
}

export default function DealCard({ deal, locale }: DealCardProps) {
  const t = useTranslations('Deal');
  const merchantName = deal.merchant?.name || 'Store';
  const hasDiscount = deal.discountPercent > 0;
  const discountHigh = deal.discountPercent >= 50;

  // Generate a gradient based on discount percentage
  const getDiscountGradient = () => {
    if (deal.discountPercent >= 70) return 'from-rose-500 to-pink-600';
    if (deal.discountPercent >= 50) return 'from-orange-500 to-rose-500';
    if (deal.discountPercent >= 30) return 'from-amber-500 to-orange-500';
    return 'from-emerald-500 to-teal-500';
  };

  return (
    <article className="group relative card-interactive h-full flex flex-col overflow-hidden">
      {/* Deal Image Section */}
      {deal.imageUrl ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/60">
          <Image
            src={deal.imageUrl}
            alt={deal.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Merchant Logo Badge */}
          <div className="absolute bottom-3 left-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden',
                'bg-white/95 backdrop-blur-sm border border-white/20 shadow-md'
              )}
            >
              {deal.merchant?.logoUrl ? (
                <Image
                  src={deal.merchant.logoUrl}
                  alt={merchantName}
                  width={28}
                  height={28}
                  className="object-contain w-7 h-7"
                />
              ) : deal.merchant?.name ? (
                <span className="text-sm font-bold text-muted-foreground">
                  {deal.merchant.name.charAt(0)}
                </span>
              ) : (
                <Store className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Badges Row - overlaid on image */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {deal.featured && (
              <div className="badge-featured">
                <Sparkles className="w-3 h-3" />
                Featured
              </div>
            )}
            {deal.exclusive && (
              <div className="badge-exclusive">
                <Crown className="w-3 h-3" />
                Exclusive
              </div>
            )}
          </div>

          {/* Countdown - overlaid on image */}
          {deal.endTime && (
            <div className="absolute top-3 right-3">
              <CountdownTimer endTime={deal.endTime} />
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute bottom-3 right-3">
              <div
                className={cn(
                  'px-2.5 py-1 rounded-lg text-white font-bold text-sm shadow-lg',
                  'bg-gradient-to-r',
                  getDiscountGradient()
                )}
              >
                {deal.discountPercent}% OFF
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback: Top Section - Discount Highlight (no deal image) */
        <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-muted/50 to-background">
          {/* Badges Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {deal.featured && (
                <div className="badge-featured">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </div>
              )}
              {deal.exclusive && (
                <div className="badge-exclusive">
                  <Crown className="w-3 h-3" />
                  Exclusive
                </div>
              )}
            </div>
            {deal.endTime && <CountdownTimer endTime={deal.endTime} />}
          </div>

          {/* Main Discount Display */}
          <div className="flex items-center gap-4">
            {/* Merchant Logo */}
            <div className="relative shrink-0">
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden',
                  'bg-white border border-border shadow-sm',
                  'transition-all duration-300 group-hover:shadow-md group-hover:scale-105'
                )}
              >
                {deal.merchant?.logoUrl ? (
                  <Image
                    src={deal.merchant.logoUrl}
                    alt={merchantName}
                    width={40}
                    height={40}
                    className="object-contain w-10 h-10"
                  />
                ) : deal.merchant?.name ? (
                  <span className="text-lg font-bold text-muted-foreground">
                    {deal.merchant.name.charAt(0)}
                  </span>
                ) : (
                  <Store className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Discount Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                {hasDiscount ? (
                  <>
                    <span
                      className={cn(
                        'text-3xl font-bold font-display',
                        deal.discountPercent >= 50
                          ? 'text-gradient-accent'
                          : 'text-gradient-primary'
                      )}
                    >
                      {deal.discountPercent}%
                    </span>
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                      OFF
                    </span>
                  </>
                ) : deal.dealPrice > 0 ? (
                  <>
                    <span className="text-3xl font-bold text-foreground font-display">
                      ${deal.dealPrice}
                    </span>
                    {deal.originalPrice > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${deal.originalPrice}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold text-primary font-display">
                    Special Deal
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-muted-foreground truncate block">
                {merchantName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info Bar - shown only when deal image exists */}
      {deal.imageUrl && (
        <div className="px-5 py-3 flex items-center justify-between gap-3 border-b border-border/50">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground truncate block">
              {merchantName}
            </span>
          </div>
          {hasDiscount ? (
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  'text-xl font-bold font-display',
                  deal.discountPercent >= 50
                    ? 'text-gradient-accent'
                    : 'text-gradient-primary'
                )}
              >
                {deal.discountPercent}%
              </span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                OFF
              </span>
            </div>
          ) : deal.dealPrice > 0 ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground font-display">
                ${deal.dealPrice}
              </span>
              {deal.originalPrice > 0 && (
                <span className="text-xs text-muted-foreground line-through">
                  ${deal.originalPrice}
                </span>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Bottom Section - Title & CTA */}
      <div className="p-5 pt-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-semibold text-base text-foreground leading-snug line-clamp-2 mb-4 min-h-[3rem] group-hover:text-primary transition-colors">
          <Link href={`/${locale}/deals/${deal.slug}`} className="hover-underline">
            {deal.title}
          </Link>
        </h3>

        <div className="mt-auto">
          {/* CTA Button - 使用原生 <a> 标签避免 Next.js Link 的 prefetch 行为 */}
          <a
            href={getTrackingUrl('deal', deal.id, deal.gotoUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl',
              'bg-muted text-foreground font-semibold text-sm',
              'transition-all duration-300',
              'group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20',
              'active:scale-[0.98]'
            )}
          >
            <span>{t('getDeal')}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Top accent line for high discount deals */}
      {discountHigh && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
            getDiscountGradient()
          )}
        />
      )}
    </article>
  );
}

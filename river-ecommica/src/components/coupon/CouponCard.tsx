import { Coupon } from '@/types';
import { Clock, BadgeCheck, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import { getTrackingUrl } from '@/lib/tracking';
import { CouponCardActions } from './CouponCardActions';

interface CouponCardProps {
  coupon: Coupon;
  locale: string;
}

function getDiscountDisplay(coupon: Coupon) {
  const { discountType, discountValue } = coupon;

  if (discountType === 1) {
    return { value: discountValue, suffix: '%', label: 'OFF' };
  }
  if (discountType === 2) {
    return { prefix: '$', value: discountValue, label: 'OFF' };
  }
  if (discountType === 3) {
    return { value: 'FREE', label: 'SHIPPING' };
  }
  return { value: 'DEAL', label: '' };
}

function getExpiryInfo(coupon: Coupon) {
  if (!coupon.endTime) return null;
  const end = new Date(coupon.endTime);
  const now = new Date();
  const diffDays = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return { text: 'Expired', urgent: false, expired: true };
  if (diffDays <= 3) return { text: `${diffDays}d left`, urgent: true, expired: false };
  if (diffDays <= 7) return { text: `${diffDays} days`, urgent: false, expired: false };
  return {
    text: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    urgent: false,
    expired: false,
  };
}

export default async function CouponCard({ coupon, locale }: CouponCardProps) {
  const t = await getTranslations({ locale, namespace: 'Deal' });
  const merchantName = coupon.merchant?.name || 'Store';
  const discount = getDiscountDisplay(coupon);
  const expiry = getExpiryInfo(coupon);

  return (
    <article className="group relative card-interactive h-full flex flex-col overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative p-5 flex flex-col flex-1">
        {/* Header: Merchant + Discount Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Merchant Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <a
              href={getTrackingUrl('coupon', coupon.id, coupon.gotoUrl)}
              target="_blank"
              rel="noopener"
              className="relative shrink-0"
            >
              <div className="w-11 h-11 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-sm">
                {coupon.merchant?.logoUrl ? (
                  <img
                    src={coupon.merchant.logoUrl}
                    alt={merchantName}
                    className="w-8 h-8 object-contain"
                  />
                ) : coupon.merchant?.name ? (
                  <span className="text-base font-bold text-muted-foreground">
                    {coupon.merchant.name.charAt(0)}
                  </span>
                ) : (
                  <Store className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </a>
            <div className="min-w-0 flex-1">
              <a
                href={getTrackingUrl('coupon', coupon.id, coupon.gotoUrl)}
                target="_blank"
                rel="noopener"
                className="font-semibold text-sm text-foreground truncate block hover:text-primary transition-colors"
              >
                {merchantName}
              </a>
              <div className="flex items-center gap-2 mt-0.5">
                {coupon.verified && (
                  <span className="badge-savings px-1.5 py-0.5 text-[10px]">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
                {expiry && !expiry.expired && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-[11px]',
                      expiry.urgent
                        ? 'text-amber-600 font-semibold'
                        : 'text-muted-foreground'
                    )}
                  >
                    <Clock className="w-3 h-3" />
                    {expiry.text}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Discount Badge */}
          <div className="shrink-0 text-right">
            <div className="inline-flex flex-col items-end">
              <span className="text-2xl font-bold tracking-tight font-display text-gradient-savings leading-none">
                {discount.prefix}
                {discount.value}
                {discount.suffix}
              </span>
              {discount.label && (
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  {discount.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {coupon.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {coupon.title || coupon.description}
          </p>
        )}

        {/* Minimum Purchase */}
        {coupon.minPurchase && (
          <div className="text-xs text-muted-foreground mb-4">
            Min. order:{' '}
            <span className="font-medium text-foreground">
              ${coupon.minPurchase}
            </span>
          </div>
        )}

        {/* Client-side Actions (copy button, code reveal, etc.) */}
        <CouponCardActions
          code={coupon.code}
          couponId={coupon.id}
          gotoUrl={coupon.gotoUrl}
          getCouponText={t('getCoupon')}
          expired={expiry?.expired}
        />
      </div>
    </article>
  );
}

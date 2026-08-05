'use client';

import { Offer } from "@/types"
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Percent, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTrackingUrl } from "@/lib/tracking"

interface OfferCardProps {
  offer: Offer;
}

// 佣金类型映射
const COMMISSION_TYPE_KEYS: Record<number, string> = {
  1: 'cps',  // Cost Per Sale
  2: 'cpa',  // Cost Per Action
  3: 'cpc',  // Cost Per Click
  4: 'cpl',  // Cost Per Lead
  5: 'cpm',  // Cost Per Mille
};

export function OfferCard({ offer }: OfferCardProps) {
  const t = useTranslations('Offer');

  const commissionTypeKey = COMMISSION_TYPE_KEYS[offer.commissionType] || 'cps';
  const isPercentage = offer.commissionType === 1; // CPS 通常是百分比

  // 格式化佣金值
  const formatCommission = () => {
    if (!offer.commissionValue) return t('commissionNA');

    if (isPercentage) {
      return `${offer.commissionValue}%`;
    }

    const currency = offer.currency || 'USD';
    return `${currency} ${offer.commissionValue}`;
  };

  const trackingUrl = getTrackingUrl('offer', offer.id, offer.gotoUrl || '#');

  return (
    <article className="group relative card-interactive h-full flex flex-col overflow-hidden bg-gradient-to-br from-emerald-50/50 to-background border border-emerald-100/50">
      <div className="p-5 flex flex-col flex-1">
        {/* Header - Commission Type Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
            {isPercentage ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
            {t(`type.${commissionTypeKey}`)}
          </span>
        </div>

        {/* Commission Value */}
        <div className="mb-3">
          <div className="text-2xl font-bold text-emerald-600 font-display">
            {formatCommission()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {t('commissionLabel')}
          </div>
        </div>

        {/* Offer Name */}
        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 mb-4 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {offer.name}
        </h3>

        {/* CTA Button - 使用原生 <a> 标签避免 Next.js Link 的 prefetch 行为 */}
        <div className="mt-auto">
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl",
              "bg-emerald-500 text-white font-semibold text-sm",
              "transition-all duration-300",
              "hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20",
              "active:scale-[0.98]",
              !offer.gotoUrl && "opacity-50 pointer-events-none"
            )}
          >
            <span>{t('visitOffer')}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </article>
  )
}

export default OfferCard;

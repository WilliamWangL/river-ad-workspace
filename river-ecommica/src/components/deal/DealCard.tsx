'use client';

import { Deal } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { useTranslations, useLocale } from 'next-intl';
import { Clock, Sparkles, Crown, ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface DealCardProps {
  deal: Deal;
}

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endTime).getTime();
      if (isNaN(end)) return null;
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) return null;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      let urgent = false;
      let text = '';

      if (days > 1) {
        text = `${days}d left`;
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        urgent = true;
        if (days === 1) text = `1d ${hours}h`;
        else text = `${hours}h ${minutes}m`;
      }
      return { text, urgent };
    };

    const update = () => {
      const result = calculateTime();
      if (result) {
        setTimeLeft(result.text);
        setIsUrgent(result.urgent);
      }
    };

    requestAnimationFrame(update);
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (!timeLeft) return null;

  return (
    <span
      role="timer"
      aria-live="off"
      aria-label="Deal countdown timer"
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold",
        isUrgent ? "text-rose-600" : "text-amber-600"
      )}
    >
      <Clock className={cn("w-3 h-3", isUrgent && "animate-pulse")} />
      {timeLeft}
    </span>
  );
}

export function DealCard({ deal }: DealCardProps) {
  const t = useTranslations('Deal');
  const locale = useLocale();
  const hasDiscount = deal.discountPercent > 0;
  const discountHigh = deal.discountPercent >= 50;

  // Generate a gradient based on discount percentage
  const getDiscountGradient = () => {
    if (deal.discountPercent >= 70) return "from-rose-500 to-pink-600";
    if (deal.discountPercent >= 50) return "from-orange-500 to-rose-500";
    if (deal.discountPercent >= 30) return "from-amber-500 to-orange-500";
    return "from-emerald-500 to-teal-500";
  };

  return (
    <article className={cn(
      "group relative bg-card rounded-2xl overflow-hidden transition-all duration-300",
      "border border-border/40 hover:border-border/80",
      "hover:shadow-lg hover:shadow-black/[0.03]",
      "hover:-translate-y-0.5"
    )}>
      {/* Top Section - Discount Highlight */}
      <div className={cn(
        "relative px-5 pt-5 pb-4",
        "bg-gradient-to-br from-slate-50/80 to-slate-100/50"
      )}>
        {/* Badges Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            {deal.featured && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                <Sparkles className="w-3 h-3" />
                Featured
              </div>
            )}
            {deal.exclusive && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-wide">
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
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden",
              "bg-white border border-slate-200/60 shadow-sm",
              "transition-all duration-300 group-hover:shadow-md group-hover:scale-105"
            )}>
              {deal.merchant.logoUrl ? (
                <Image
                  src={deal.merchant.logoUrl}
                  alt={deal.merchant.name}
                  width={40}
                  height={40}
                  className="object-contain w-10 h-10"
                />
              ) : (
                <span className="text-lg font-bold text-slate-400">
                  {deal.merchant.name.charAt(0)}
                </span>
              )}
            </div>
          </div>

          {/* Discount Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              {hasDiscount ? (
                <>
                  <span className={cn(
                    "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                    getDiscountGradient()
                  )}>
                    {deal.discountPercent}%
                  </span>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                    OFF
                  </span>
                </>
              ) : deal.dealPrice > 0 ? (
                <>
                  <span className="text-3xl font-bold text-foreground">
                    ${deal.dealPrice}
                  </span>
                  {deal.originalPrice > 0 && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${deal.originalPrice}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  Special Deal
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-muted-foreground truncate block">
              {deal.merchant.name}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section - Title & CTA */}
      <div className="p-5 pt-4">
        {/* Title */}
        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 mb-4 min-h-[2.5rem] group-hover:text-primary transition-colors">
          <Link
            href={`/${locale}/deals/${deal.slug || deal.id}`}
            className="hover:underline decoration-primary/30 underline-offset-2"
          >
            {deal.title}
          </Link>
        </h3>

        {/* CTA Button */}
        <Link
          href={deal.trackingLinkId ? `/api/go/${deal.trackingLinkId}` : (deal.gotoUrl || '#')}
          target="_blank"
          rel="noopener"
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl",
            "bg-foreground text-background font-semibold text-sm",
            "transition-all duration-300",
            deal.gotoUrl ? "hover:opacity-90 hover:shadow-md" : "opacity-50 cursor-not-allowed",
            "active:scale-[0.98]"
          )}
        >
          <span>{t('getDeal')}</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Top accent line for high discount deals */}
      {discountHigh && (
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          getDiscountGradient()
        )} />
      )}
    </article>
  )
}

export default DealCard;

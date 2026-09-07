'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTrackingUrl } from '@/lib/tracking';

interface CouponCardActionsProps {
  code: string;
  couponId: number;
  gotoUrl: string;
  getCouponText: string;
  expired?: boolean;
}

export function CouponCardActions({
  code,
  couponId,
  gotoUrl,
  getCouponText,
  expired,
}: CouponCardActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setIsRevealed(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayCode = isRevealed ? code : code.slice(0, 3) + '••••••';

  return (
    <div className="mt-auto">
      {/* Code Section */}
      <div className="relative">
        {/* Decorative dashed line */}
        <div className="absolute -left-5 -right-5 top-0 border-t border-dashed border-border/60" />

        <div className="pt-4">
          <div className="flex items-center gap-2">
            {/* Code Display */}
            <div
              className={cn(
                'flex-1 relative overflow-hidden rounded-xl transition-all duration-300',
                'bg-muted/30 border border-border',
                copied && 'border-emerald-500/30 bg-emerald-50/30'
              )}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <code
                  className={cn(
                    'font-mono font-bold text-sm tracking-wider transition-all duration-300',
                    isRevealed ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {displayCode}
                </code>
                {!isRevealed && (
                  <button
                    onClick={() => setIsRevealed(true)}
                    className="text-[11px] text-primary font-medium hover:underline"
                  >
                    Reveal
                  </button>
                )}
              </div>
            </div>

            {/* Copy Button */}
            <Button
              onClick={handleCopy}
              className={cn(
                'h-12 px-5 rounded-xl font-semibold text-sm transition-all duration-300',
                'shadow-sm hover:shadow-md active:scale-[0.98]',
                copied
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-foreground hover:bg-foreground/90 text-background'
              )}
            >
              {copied ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-4 flex items-center justify-between">
        <a
          href={getTrackingUrl('coupon', couponId, gotoUrl)}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group/link hover-underline"
        >
          <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
          {getCouponText}
        </a>

        {expired && (
          <span className="text-[11px] text-muted-foreground">Expired</span>
        )}
      </div>

      {/* Sparkle effect on copy */}
      {copied && (
        <div className="absolute top-4 right-4 animate-ping">
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>
      )}
    </div>
  );
}

export default CouponCardActions;

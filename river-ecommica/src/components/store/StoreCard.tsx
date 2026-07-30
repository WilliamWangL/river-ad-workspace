import { Store } from "@/types"
import Link from "next/link"
import Image from "next/image"
import { Star, ArrowUpRight, Tag, Ticket } from "lucide-react"
import { cn, stripHtml } from "@/lib/utils"

export function StoreCard({ store, locale = 'en' }: { store: Store; locale?: string }) {
  const rating = store.rating || 0;
  const hasOffers = (store.dealCount || 0) + (store.couponCount || 0) > 0;

  return (
    <Link href={`/${locale}/stores/${store.slug}`} className="group block h-full">
      <article className="h-full relative card-interactive flex flex-col overflow-hidden">
        {/* Header with Logo */}
        <div className="relative p-5 pb-4 flex-1">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="relative shrink-0">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden",
                "bg-white border border-border",
                "transition-all duration-300 group-hover:shadow-md group-hover:scale-105"
              )}>
                {store.logoUrl ? (
                  <Image
                    src={store.logoUrl}
                    alt={store.name}
                    width={48}
                    height={48}
                    className="object-contain w-12 h-12"
                  />
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">
                    {store.name[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate mb-1">
                {store.name}
              </h3>

              {/* Rating */}
              {rating > 0 ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-3.5 h-3.5",
                          star <= Math.round(rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">New Store</span>
              )}
            </div>

            {/* Arrow */}
            <div className={cn(
              "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              "bg-muted text-muted-foreground",
              "transition-all duration-300",
              "group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110"
            )}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Description if available */}
          {store.description && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {stripHtml(store.description)}
              </p>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="border-t border-border/50 bg-muted/30 mt-auto">
          <div className="flex">
            <div className="flex-1 py-3 px-5 flex items-center justify-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{store.dealCount || 0}</span>
              <span className="text-sm text-muted-foreground">Deals</span>
            </div>
            <div className="w-px bg-border/50" />
            <div className="flex-1 py-3 px-5 flex items-center justify-center gap-2">
              <Ticket className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{store.couponCount || 0}</span>
              <span className="text-sm text-muted-foreground">Codes</span>
            </div>
          </div>
        </div>

        {/* Highlight indicator for stores with offers */}
        {hasOffers && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        )}
      </article>
    </Link>
  )
}

export default StoreCard;

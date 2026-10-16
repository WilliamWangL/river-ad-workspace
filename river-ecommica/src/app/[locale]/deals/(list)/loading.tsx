import { Skeleton, DealCardSkeleton } from '@/components/ui/skeleton';

export default function DealsLoading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="relative section-gradient overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <Skeleton className="h-6 w-24 rounded-full mb-6" />
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-12 w-1/2 mb-4" />
              <Skeleton className="h-6 w-full max-w-xl" />
            </div>

            <div className="flex flex-wrap gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="stat-card min-w-[140px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-14 sm:top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <Skeleton className="h-11 w-full max-w-md rounded-xl" />
        </div>
      </div>

      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <DealCardSkeleton key={i} />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
      </section>
    </main>
  );
}

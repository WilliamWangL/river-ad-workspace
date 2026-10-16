import { Skeleton } from '@/components/ui/skeleton';

export default function BlogLoading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="relative section-gradient py-12 md:py-16 border-b border-border/50">
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl w-full">
              <div className="flex items-center gap-3 mb-5">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-6 w-full max-w-xl" />
            </div>

            <div className="flex gap-4 md:gap-6 flex-wrap lg:flex-nowrap">
              {[1, 2, 3].map((i) => (
                <div key={i} className="stat-card min-w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-8 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-full border border-border/50 rounded-2xl overflow-hidden flex flex-col bg-card">
              <div className="relative h-48 bg-muted">
                <Skeleton className="w-full h-full" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <Skeleton className="h-7 w-full mb-2" />
                <Skeleton className="h-7 w-2/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3.5 h-3.5 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3.5 h-3.5 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
      </section>
    </main>
  );
}

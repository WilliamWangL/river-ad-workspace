'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollSentinelProps {
  /** 是否还有更多数据可加载 */
  hasMore: boolean;
  /** 是否正在加载中 */
  isLoading: boolean;
  /** 触发加载更多的回调 */
  onLoadMore: () => void;
  /** 服务端渲染的初始内容 */
  children: ReactNode;
  /** 客户端追加的新内容 */
  newItems?: ReactNode;
  /** 列表容器的 className（grid 等） */
  gridClassName?: string;
}

export function InfiniteScrollSentinel({
  hasMore,
  isLoading,
  onLoadMore,
  children,
  newItems,
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6',
}: InfiniteScrollSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '400px' }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <>
      <div className={gridClassName}>
        {children}
        {newItems}
      </div>

      {/* Sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-10">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

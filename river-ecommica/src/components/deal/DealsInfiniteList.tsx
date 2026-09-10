'use client';

import { useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { Deal } from '@/types';
import DealCard from '@/components/deal/DealCard';
import { InfiniteScrollSentinel } from '@/components/ui/InfiniteScrollSentinel';

const API_BASE = '/app-api';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '1';

interface DealsInfiniteListProps {
  initialCount: number;
  total: number;
  pageSize: number;
  locale: string;
  categoryId?: number;
  children: ReactNode;
}

export function DealsInfiniteList({
  initialCount,
  total,
  pageSize,
  locale,
  categoryId,
  children,
}: DealsInfiniteListProps) {
  const [newItems, setNewItems] = useState<ReactNode[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCount < total);
  const abortRef = useRef<AbortController | null>(null);

  // 分类切换时重置分页状态并中止旧请求
  useEffect(() => {
    abortRef.current?.abort();
    setNewItems([]);
    setPage(1);
    setLoading(false);
    setHasMore(initialCount < total);
  }, [categoryId, initialCount, total]);

  const loadMore = useCallback(async () => {
    if (loading) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const url = new URL(`${API_BASE}/coupon/deal/page`, window.location.origin);
      url.searchParams.set('pageNo', String(nextPage));
      url.searchParams.set('pageSize', String(pageSize));
      if (categoryId) {
        url.searchParams.set('categoryId', String(categoryId));
      }

      const res = await fetch(url.toString(), {
        headers: { 'tenant-id': TENANT_ID },
        signal: controller.signal,
      });
      const json = await res.json();
      const deals: Deal[] = json.data?.list || [];

      if (deals.length > 0) {
        const cards = deals.map((deal) => (
          <DealCard key={`new-${deal.id}`} deal={deal} locale={locale} />
        ));
        setNewItems((prev) => [...prev, ...cards]);
        setPage(nextPage);
      }

      const loaded = initialCount + newItems.length + deals.length;
      if (loaded >= total || deals.length === 0) {
        setHasMore(false);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setHasMore(false);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, pageSize, locale, loading, initialCount, newItems.length, total, categoryId]);

  return (
    <InfiniteScrollSentinel
      hasMore={hasMore}
      isLoading={loading}
      onLoadMore={loadMore}
      newItems={newItems.length > 0 ? <>{newItems}</> : undefined}
    >
      {children}
    </InfiniteScrollSentinel>
  );
}

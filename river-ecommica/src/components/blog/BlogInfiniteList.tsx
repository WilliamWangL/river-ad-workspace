'use client';

import { useState, useCallback, ReactNode } from 'react';
import { BlogPost } from '@/types';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { InfiniteScrollSentinel } from '@/components/ui/InfiniteScrollSentinel';

const API_BASE = '/app-api';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '1';

// BlogPost type 映射（与 api.ts 保持一致）
const POST_TYPE_MAP: Record<number, BlogPost['type']> = {
  1: 'deal',
  2: 'review',
  3: 'tutorial',
  4: 'news'
};

function mapPostType(post: Record<string, unknown>): BlogPost {
  return {
    ...post,
    type: POST_TYPE_MAP[post.type as number] || 'news'
  } as BlogPost;
}

interface BlogInfiniteListProps {
  initialCount: number;
  total: number;
  pageSize: number;
  locale: string;
  children: ReactNode;
}

export function BlogInfiniteList({
  initialCount,
  total,
  pageSize,
  locale,
  children,
}: BlogInfiniteListProps) {
  const [newItems, setNewItems] = useState<ReactNode[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCount < total);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const url = new URL(`${API_BASE}/blog/post/page`, window.location.origin);
      url.searchParams.set('pageNo', String(nextPage));
      url.searchParams.set('pageSize', String(pageSize));

      const res = await fetch(url.toString(), {
        headers: { 'tenant-id': TENANT_ID },
      });
      const json = await res.json();
      const rawPosts: Record<string, unknown>[] = json.data?.list || [];
      const posts = rawPosts.map(mapPostType);

      if (posts.length > 0) {
        const cards = posts.map((post) => (
          <BlogPostCard key={`new-${post.id}`} post={post} locale={locale} />
        ));
        setNewItems((prev) => [...prev, ...cards]);
        setPage(nextPage);
      }

      const loaded = initialCount + newItems.length + posts.length;
      if (loaded >= total || posts.length === 0) {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, locale, loading, initialCount, newItems.length, total]);

  return (
    <InfiniteScrollSentinel
      hasMore={hasMore}
      isLoading={loading}
      onLoadMore={loadMore}
      gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      newItems={newItems.length > 0 ? <>{newItems}</> : undefined}
    >
      {children}
    </InfiniteScrollSentinel>
  );
}

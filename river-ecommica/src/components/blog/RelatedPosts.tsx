import { BlogPost } from '@/types';
import { fetchPosts } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Calendar, Eye, FileText } from 'lucide-react';

interface RelatedPostsProps {
  type: BlogPost['type'];
  currentPostId: number;
  locale: string;
}

/** Fisher-Yates shuffle (returns new array) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function RelatedPosts({ type, currentPostId, locale }: RelatedPostsProps) {
  const t = await getTranslations({ locale, namespace: 'BlogDetail' });

  // Fetch posts of the same type
  const { list: allPosts } = await fetchPosts({ type, pageSize: 12 });

  // Exclude current post, shuffle, take 3
  const related = shuffle(allPosts.filter(p => p.id !== currentPostId)).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-display text-foreground">
            {t('relatedPosts')}
          </h2>
          <Link
            href={`/${locale}/blog`}
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            {t('viewMore')} <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {related.map(post => (
            <RelatedPostCard key={post.id} post={post} locale={locale} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedPostCard({ post, locale, t }: { post: BlogPost; locale: string; t: (key: string, opts?: Record<string, unknown>) => string }) {
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deal: t('typeDeal'),
      review: t('typeReview'),
      tutorial: t('typeTutorial'),
      news: t('typeNews'),
    };
    return labels[type] || type;
  };

  return (
    <article className="group bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      {/* Cover image */}
      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <FileText size={32} />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-primary/90 text-white text-xs font-semibold rounded-full px-2 py-0.5">
          {getTypeLabel(post.type)}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
          <Link href={`/${locale}/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(post.publishedAt).toLocaleDateString()}
            </span>
            {post.viewCount !== undefined && (
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {post.viewCount}
              </span>
            )}
          </div>
          <Link
            href={`/${locale}/blog/${post.slug}`}
            className="text-primary font-semibold hover:underline flex items-center gap-0.5"
          >
            {t('readMore')} <ArrowUpRight size={11} />
          </Link>
        </div>
      </div>
    </article>
  );
}

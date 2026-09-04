'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Star, ArrowRight, User, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BlogPostCardProps {
  post: BlogPost;
  locale: string;
}

export default function BlogPostCard({ post, locale }: BlogPostCardProps) {
  const t = useTranslations('blog');

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; color: string; bg: string }> = {
      deal: { label: t('typeDeal'), color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
      review: { label: t('typeReview'), color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
      tutorial: { label: t('typeTutorial'), color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
      news: { label: t('typeNews'), color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' }
    };
    return configs[type] || { label: type, color: 'text-muted-foreground', bg: 'bg-muted border-border' };
  };

  const typeConfig = getTypeConfig(post.type);

  return (
    <Link href={`/${locale}/blog/${post.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden card-interactive border-border/50 rounded-2xl flex flex-col">
        {/* Cover Image */}
        <div className="relative h-48 bg-muted overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/20" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${typeConfig.bg} ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
            {post.featured && (
              <div className="badge-featured">
                <Star className="w-3 h-3" />
                {t('badgeFeatured')}
              </div>
            )}
          </div>

          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-10">
            <div className="bg-background/20 p-2 rounded-full backdrop-blur-sm">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <CardContent className="p-5 flex flex-col flex-1">
          <h2 className="font-display font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
            {post.title}
          </h2>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50 mt-auto">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="font-medium">{post.authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}



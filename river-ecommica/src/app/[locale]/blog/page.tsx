import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchPosts } from '@/lib/api';
import { PAGINATION } from '@/constants/pagination';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { BlogInfiniteList } from '@/components/blog/BlogInfiniteList';
import { EmptyState } from '@/components/ui/empty-state';
import { JsonLd, BASE_URL, generateBreadcrumbJsonLd, generateItemListJsonLd } from '@/components/seo/JsonLd';
import {
  BookOpen,
  Sparkles,
  FileText,
  TrendingUp,
  Star
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'blog' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
      languages: {
        'en': `${BASE_URL}/en/blog`,
        'zh': `${BASE_URL}/zh/blog`,
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `${BASE_URL}/${locale}/blog`,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('meta.title'),
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title'),
      description: t('meta.description'),
      images: ['/og-image.png'],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'blog' });
  const pageSize = PAGINATION.PAGE_SIZE.BLOG;

  const { list: posts, total } = await fetchPosts({
    pageNo: 1,
    pageSize
  });

  const totalPosts = total;
  const featuredCount = posts.filter(p => p.featured).length;

  const breadcrumbJsonLdItems = [
    { name: t('breadcrumbHome'), url: `${BASE_URL}/${locale}` },
    { name: t('breadcrumbBlog'), url: `${BASE_URL}/${locale}/blog` },
  ];
  const itemListJsonLdItems = posts
    .filter(post => post.slug)
    .map(post => ({
      name: post.title,
      url: `${BASE_URL}/${locale}/blog/${post.slug}`
    }));

  return (
    <>
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />
      {itemListJsonLdItems.length > 0 && (
        <JsonLd data={generateItemListJsonLd(itemListJsonLdItems, 'Blog')} />
      )}
      <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative section-gradient py-12 md:py-16 border-b border-border/50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-secondary/20 to-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            {/* Title Section */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="badge-featured">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('badgeFreshContent')}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight mb-4">
                {t('heroTitle')}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {t('heroDescription')}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4 md:gap-6 flex-wrap lg:flex-nowrap">
              <div className="stat-card min-w-[120px]">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                  <FileText className="w-4 h-4" />
                  <span>{t('statArticles')}</span>
                </div>
                <span className="stat-value">{totalPosts.toLocaleString()}</span>
              </div>
              <div className="stat-card min-w-[120px]">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>{t('statFeatured')}</span>
                </div>
                <span className="stat-value text-gradient-primary">{featuredCount.toLocaleString()}</span>
              </div>
              <div className="stat-card min-w-[120px]">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>{t('statThisWeek')}</span>
                </div>
                <span className="stat-value">{t('statNew')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 py-10">
        {posts.length > 0 ? (
          <BlogInfiniteList
            initialCount={posts.length}
            total={total}
            pageSize={pageSize}
            locale={locale}
          >
            {posts.map(post => (
              <BlogPostCard key={post.id} post={post} locale={locale} />
            ))}
          </BlogInfiniteList>
        ) : (
          <div className="card-elevated p-12">
            <EmptyState
              icon="book"
              title={t('emptyTitle')}
              description={t('emptyDescription')}
            />
          </div>
        )}
      </section>
      </main>
    </>
  );
}

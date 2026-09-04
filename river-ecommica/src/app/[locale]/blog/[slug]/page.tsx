import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchPosts, fetchPostBySlug } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { JsonLd, BASE_URL, generateBlogPostJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { MarkdownRenderer } from '@/components/blog';
import { Calendar, Eye, User, Tag } from 'lucide-react';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ShareButtons } from '@/components/layout/ShareButtons';
import { FeedbackForm } from '@/components/layout/FeedbackForm';

// next-intl 的 getTranslations 会内部调用 headers()，与 ISR 冲突
// 使用 force-dynamic 确保 SSR 正常，数据缓存通过 API 层 revalidate 实现
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const { list: posts } = await fetchPosts();
    const locales = ['en', 'zh'];

    return locales.flatMap(locale =>
      posts
        .filter(post => post.slug && typeof post.slug === 'string')
        .map(post => ({
          locale,
          slug: post.slug,
        }))
    );
  } catch {
    // 构建时 API 不可用，返回空数组，页面将在运行时动态渲染
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'BlogDetail' });
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return { title: t('meta.notFound') };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog/${post.slug}`,
      languages: {
        'en': `${BASE_URL}/en/blog/${post.slug}`,
        'zh': `${BASE_URL}/zh/blog/${post.slug}`,
      },
    },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      url: `${BASE_URL}/${locale}/blog/${post.slug}`,
      type: 'article',
      images: [
        {
          url: post.coverImage || '/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.coverImage || '/og-image.png'],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'BlogDetail' });
  const tFeedback = await getTranslations({ locale, namespace: 'Feedback' });
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deal: t('typeDeal'),
      review: t('typeReview'),
      tutorial: t('typeTutorial'),
      news: t('typeNews')
    };
    return labels[type] || type;
  };

  const breadcrumbs = [
    { label: t('breadcrumbHome'), href: '/' },
    { label: t('breadcrumbBlog'), href: '/blog' },
    { label: post.title, href: `/blog/${post.slug}` },
  ];

  const breadcrumbJsonLdItems = breadcrumbs.map(item => ({
    name: item.label,
    url: `${BASE_URL}/${locale}${item.href}`
  }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={generateBlogPostJsonLd(post, locale)} />
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbJsonLdItems)} />
      <main className="min-h-screen bg-dots-pattern pb-16">
        <div className="relative h-[400px] w-full bg-gray-900 overflow-hidden">
          {post.coverImage ? (
            <>
              <Image 
                src={post.coverImage} 
                alt={post.title} 
                fill 
                className="object-cover opacity-60" 
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
          )}
          
          <div className="absolute bottom-0 left-0 w-full p-8 pb-12">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary/90 hover:bg-primary text-white border-none backdrop-blur-sm">
                  {getTypeLabel(post.type)}
                </Badge>
                {post.featured && (
                  <Badge variant="secondary" className="bg-amber-500/90 text-white border-none backdrop-blur-sm">
                    {t('badgeFeatured')}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-6 leading-tight shadow-sm">
                {post.title}
              </h1>

              <ShareButtons title={post.title} variant="dark" labels={{ share: t('share') }} />

              <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm font-medium">
                <div className="flex items-center gap-2">
                  {post.authorAvatar ? (
                    <Image 
                      src={post.authorAvatar} 
                      alt={post.authorName} 
                      width={32} 
                      height={32} 
                      className="rounded-full border-2 border-white/20" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                      <User size={16} />
                    </div>
                  )}
                  <span>{post.authorName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
                
                {post.viewCount && (
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{t('views', { count: post.viewCount })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <article className="container mx-auto px-4 max-w-4xl -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-border/50">
            {post.content ? (
              <MarkdownRenderer content={post.content} className="prose prose-lg prose-slate max-w-none" />
            ) : (
              <p className="text-xl text-gray-600 leading-relaxed">{post.excerpt}</p>
            )}
            
            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag size={16} />
                <span>{t('filedUnder', { type: getTypeLabel(post.type) })}</span>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <RelatedPosts
            type={post.type}
            currentPostId={post.id}
            locale={locale}
          />

          {/* Feedback Form */}
          <FeedbackForm
            locale={locale}
            sourceType="blog"
            sourcePage={post.slug}
            labels={{
              title: tFeedback('title'),
              subtitle: tFeedback('subtitle'),
              namePlaceholder: tFeedback('namePlaceholder'),
              emailPlaceholder: tFeedback('emailPlaceholder'),
              messagePlaceholder: tFeedback('messagePlaceholder'),
              submit: tFeedback('submit'),
              submitting: tFeedback('submitting'),
              successTitle: tFeedback('successTitle'),
              successMessage: tFeedback('successMessage'),
              errorTitle: tFeedback('errorTitle'),
              errorMessage: tFeedback('errorMessage'),
            }}
          />
        </article>
      </main>
    </>
  );
}

import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/layout/PageHero';
import { LegalPageLayout } from '@/components/layout/LegalPageLayout';
import { BASE_URL } from '@/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal' });
  return {
    title: t('terms.meta.title'),
    description: t('terms.meta.description'),
    openGraph: {
      title: t('terms.meta.title'),
      description: t('terms.meta.description'),
      url: `${BASE_URL}/${locale}/terms-of-service`,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('terms.meta.title'),
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('terms.meta.title'),
      description: t('terms.meta.description'),
      images: ['/og-image.png'],
    },
  };
}

export default async function TermsOfServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal' });

  const sections = [
    {
      id: 'intro',
      title: t('terms.sections.intro.title'),
      content: t('terms.sections.intro.content'),
    },
    {
      id: 'service',
      title: t('terms.sections.service.title'),
      content: t('terms.sections.service.content'),
    },
    {
      id: 'user',
      title: t('terms.sections.user.title'),
      content: t('terms.sections.user.content'),
    },
    {
      id: 'disclaimer',
      title: t('terms.sections.disclaimer.title'),
      content: t('terms.sections.disclaimer.content'),
    },
    {
      id: 'ip',
      title: t('terms.sections.ip.title'),
      content: t('terms.sections.ip.content'),
    },
    {
      id: 'termination',
      title: t('terms.sections.termination.title'),
      content: t('terms.sections.termination.content'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title={t('terms.title')}
        variant="light"
        size="compact"
        date={t('lastUpdated', { date: 'January 2026' })}
      />
      <LegalPageLayout
        title={t('terms.title')}
        lastUpdated={t('lastUpdated', { date: 'January 2026' })}
        tocLabel={t('tableOfContents')}
        relatedLinksLabel={t('relatedLinks')}
        sections={sections}
        currentPage="terms"
        relatedPages={{
          privacy: t('privacy.title'),
          terms: t('terms.title'),
          cookies: t('cookies.title'),
        }}
      />
    </div>
  );
}

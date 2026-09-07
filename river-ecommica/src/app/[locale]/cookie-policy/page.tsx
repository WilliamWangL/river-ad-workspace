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
    title: t('cookies.meta.title'),
    description: t('cookies.meta.description'),
    openGraph: {
      title: t('cookies.meta.title'),
      description: t('cookies.meta.description'),
      url: `${BASE_URL}/${locale}/cookie-policy`,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('cookies.meta.title'),
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('cookies.meta.title'),
      description: t('cookies.meta.description'),
      images: ['/og-image.png'],
    },
  };
}

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal' });

  const sections = [
    {
      id: 'intro',
      title: t('cookies.sections.intro.title'),
      content: t('cookies.sections.intro.content'),
    },
    {
      id: 'types',
      title: t('cookies.sections.types.title'),
      content: t('cookies.sections.types.content'),
    },
    {
      id: 'purpose',
      title: t('cookies.sections.purpose.title'),
      content: t('cookies.sections.purpose.content'),
    },
    {
      id: 'thirdParty',
      title: t('cookies.sections.thirdParty.title'),
      content: t('cookies.sections.thirdParty.content'),
    },
    {
      id: 'manage',
      title: t('cookies.sections.manage.title'),
      content: t('cookies.sections.manage.content'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title={t('cookies.title')}
        variant="light"
        size="compact"
        date={t('lastUpdated', { date: 'January 2026' })}
      />
      <LegalPageLayout
        title={t('cookies.title')}
        lastUpdated={t('lastUpdated', { date: 'January 2026' })}
        tocLabel={t('tableOfContents')}
        relatedLinksLabel={t('relatedLinks')}
        sections={sections}
        currentPage="cookies"
        relatedPages={{
          privacy: t('privacy.title'),
          terms: t('terms.title'),
          cookies: t('cookies.title'),
        }}
      />
    </div>
  );
}

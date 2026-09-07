import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/layout/PageHero';
import { BASE_URL } from '@/components/seo/JsonLd';
import { Eye, Award, Shield } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `${BASE_URL}/${locale}/about`,
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

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

  const stats = [
    { value: t('stats.users'), label: t('stats.usersLabel') },
    { value: t('stats.stores'), label: t('stats.storesLabel') },
    { value: t('stats.brands'), label: t('stats.brandsLabel') },
    { value: t('stats.validRate'), label: t('stats.validRateLabel') },
  ];

  const values = [
    {
      icon: Eye,
      title: t('values.transparency.title'),
      description: t('values.transparency.description'),
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      icon: Award,
      title: t('values.quality.title'),
      description: t('values.quality.description'),
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/20',
    },
    {
      icon: Shield,
      title: t('values.trust.title'),
      description: t('values.trust.description'),
      gradient: 'from-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <PageHero title={t('heroTitle')} subtitle={t('heroSubtitle')} variant="dark" size="default" />

      {/* Our Story Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="animate-in fade-in slide-in-from-left-6 duration-700">
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6">
                  {t('storyTitle')}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">{t('storyContent')}</p>
              </div>

              {/* Decorative Gradient Block */}
              <div className="relative animate-in fade-in slide-in-from-right-6 duration-700 delay-150">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-purple-500/20 border border-white/10 backdrop-blur-sm">
                  {/* Floating accent elements */}
                  <div className="absolute top-8 left-8 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl shadow-amber-500/30 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">E</span>
                  </div>
                  <div className="absolute bottom-12 right-12 w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20" />
                  <div className="absolute top-1/2 right-8 w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-50/50 via-slate-100/50 to-slate-50/50 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-8 rounded-2xl bg-card border border-border/50 animate-in fade-in zoom-in-95"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="text-4xl lg:text-5xl font-display font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              {t('valuesTitle')}
            </h2>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {values.map(({ icon: Icon, title, description, gradient, shadowColor }, index) => (
              <div
                key={title}
                className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                {/* Icon */}
                <div
                  className={`inline-flex p-3.5 rounded-xl bg-gradient-to-br ${gradient} ${shadowColor} shadow-lg mb-6`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-bold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>

                {/* Hover accent */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

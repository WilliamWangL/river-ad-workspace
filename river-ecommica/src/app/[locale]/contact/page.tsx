import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/button';
import { JsonLd, BASE_URL, generateOrganizationJsonLd } from '@/components/seo/JsonLd';
import { Mail, Share2, Briefcase, HelpCircle, ArrowRight, Twitter, Facebook, Instagram } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `${BASE_URL}/${locale}/contact`,
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

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });

  const contactCards = [
    {
      icon: Mail,
      title: t('email.title'),
      description: t('email.description'),
      content: t('email.address'),
      href: `mailto:${t('email.address')}`,
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      icon: Share2,
      title: t('social.title'),
      description: t('social.description'),
      social: [
        { name: t('social.twitter'), icon: Twitter, href: 'https://twitter.com/ecommica' },
        { name: t('social.facebook'), icon: Facebook, href: 'https://facebook.com/ecommica' },
        { name: t('social.instagram'), icon: Instagram, href: 'https://instagram.com/ecommica' },
      ],
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/20',
    },
    {
      icon: Briefcase,
      title: t('info.title'),
      description: t('info.description'),
      content: t('info.hours'),
      subContent: t('info.partnerships'),
      href: `mailto:${t('info.partnerships')}`,
      gradient: 'from-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/20',
    },
  ];

  return (
    <>
      <JsonLd data={generateOrganizationJsonLd({ email: 'support@ecommica.com', url: BASE_URL })} />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <PageHero title={t('heroTitle')} subtitle={t('heroSubtitle')} variant="light" size="default" />

      {/* Contact Cards Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {contactCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group relative p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                >
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3.5 rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadowColor} shadow-lg mb-6`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{card.description}</p>

                  {/* Social Links */}
                  {card.social ? (
                    <div className="flex gap-3">
                      {card.social.map((social) => {
                        const SocialIcon = social.icon;
                        return (
                          <a
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={social.name}
                          >
                            <SocialIcon className="w-5 h-5" />
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <a
                        href={card.href}
                        className="block text-primary font-semibold hover:underline"
                      >
                        {card.content}
                      </a>
                      {card.subContent && (
                        <a
                          href={`mailto:${card.subContent}`}
                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {card.subContent}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Hover accent */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Callout Section */}
      <section className="pb-16 lg:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                {t('faqCallout.title')}
              </h3>
              <p className="text-muted-foreground mb-6">{t('faqCallout.description')}</p>
              <Button asChild className="rounded-xl px-6">
                <Link href={`/${locale}/faq`}>
                  {t('faqCallout.link')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

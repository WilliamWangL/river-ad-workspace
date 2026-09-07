import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { JsonLd, BASE_URL, generateFAQPageJsonLd } from '@/components/seo/JsonLd';
import { Tag, Gift, Users, MessageCircle, ArrowRight } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'faq' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `${BASE_URL}/${locale}/faq`,
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

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'faq' });

  const faqCategories = [
    {
      id: 'coupons',
      icon: Tag,
      title: t('categories.coupons.title'),
      gradient: 'from-emerald-500 to-teal-600',
      questions: [
        { q: t('categories.coupons.q1.question'), a: t('categories.coupons.q1.answer') },
        { q: t('categories.coupons.q2.question'), a: t('categories.coupons.q2.answer') },
        { q: t('categories.coupons.q3.question'), a: t('categories.coupons.q3.answer') },
      ],
    },
    {
      id: 'deals',
      icon: Gift,
      title: t('categories.deals.title'),
      gradient: 'from-violet-500 to-purple-600',
      questions: [
        { q: t('categories.deals.q1.question'), a: t('categories.deals.q1.answer') },
        { q: t('categories.deals.q2.question'), a: t('categories.deals.q2.answer') },
        { q: t('categories.deals.q3.question'), a: t('categories.deals.q3.answer') },
      ],
    },
    {
      id: 'account',
      icon: Users,
      title: t('categories.account.title'),
      gradient: 'from-amber-500 to-orange-600',
      questions: [
        { q: t('categories.account.q1.question'), a: t('categories.account.q1.answer') },
        { q: t('categories.account.q2.question'), a: t('categories.account.q2.answer') },
      ],
    },
  ];

  // Flatten all FAQ questions for JSON-LD
  const allFaqs = faqCategories.flatMap(category =>
    category.questions.map(q => ({
      question: q.q,
      answer: q.a,
    }))
  );

  return (
    <>
      <JsonLd data={generateFAQPageJsonLd(allFaqs)} />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <PageHero title={t('heroTitle')} subtitle={t('heroSubtitle')} variant="dark" size="default" />

      {/* FAQ Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {faqCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className="rounded-2xl bg-card border border-border/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${categoryIndex * 100}ms`, animationFillMode: 'both' }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 p-6 border-b border-border/50">
                    <div
                      className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${category.gradient} shadow-lg`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-foreground">
                      {category.title}
                    </h2>
                  </div>

                  {/* Questions Accordion */}
                  <Accordion type="single" collapsible className="px-6">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        key={`${category.id}-${index}`}
                        value={`${category.id}-${index}`}
                        className="border-border/50"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-5">
                          <span className="font-medium text-foreground">{faq.q}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="pb-16 lg:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-center relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/20 rounded-full blur-[60px]" />
                <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-violet-500/15 rounded-full blur-[50px]" />
              </div>

              <div className="relative">
                <div className="inline-flex p-3 rounded-xl bg-white/10 backdrop-blur-sm mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  {t('contactCta.title')}
                </h3>
                <p className="text-slate-300 mb-6">{t('contactCta.description')}</p>
                <Button
                  asChild
                  className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-6 font-semibold"
                >
                  <Link href={`/${locale}/contact`}>
                    {t('contactCta.link')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import "@/app/globals.css";
import { Metadata } from 'next';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import { BASE_URL } from '@/components/seo/JsonLd';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | Ecommica',
    default: 'Ecommica - Best Deals & Coupons'
  },
  description: 'Find the best deals and coupons for your favorite stores.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Ecommica',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ecommica - Best Deals & Coupons',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ecommica',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en': BASE_URL,
      'zh': `${BASE_URL}/zh`,
    },
  },
  other: {
    'mitgo-verification': '8ece394d-b3b0-47fa-9650-b6dac6eaa396',
  },
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;

  if (!['en', 'zh'].includes(locale)) {
    notFound();
  }

  // 告诉 next-intl 当前 locale，避免 getTranslations 调用 headers()
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans">
        <GoogleAnalytics />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
          Skip to main content
        </a>
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main id="main-content" className="flex-grow">
               {children}
            </main>
            <Footer locale={locale} />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

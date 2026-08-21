import { Deal, Store, BlogPost, Coupon } from '@/types';
import { stripHtml } from '@/lib/utils';

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://deals.ecommica.com';

export function generateDealJsonLd(deal: Deal) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: deal.title,
    description: stripHtml(deal.description, 160) || undefined,
    url: `${BASE_URL}/deals/${deal.slug}`,
    priceCurrency: 'USD',
    price: deal.dealPrice || 0,
    priceValidUntil: deal.endTime,
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: deal.merchant.name,
    },
    ...(deal.discountPercent > 0 && {
      discount: `${deal.discountPercent}%`,
    }),
  };
}

export function generateStoreJsonLd(store: Store) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: store.name,
    description: stripHtml(store.description, 160) || undefined,
    url: `${BASE_URL}/stores/${store.slug}`,
    logo: store.logoUrl || undefined,
    ...(store.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: store.rating,
        bestRating: 5,
      },
    }),
  };
}

export function generateBlogPostJsonLd(post: BlogPost, locale: string = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    url: `${BASE_URL}/${locale}/blog/${post.slug}`,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ecommica Deals',
      url: BASE_URL,
    },
  };
}

function getDiscountText(discountType: number, discountValue: number): string {
  switch (discountType) {
    case 1:
      return `${discountValue}% off`;
    case 2:
      return `$${discountValue} off`;
    default:
      return 'Free shipping';
  }
}

export function generateCouponJsonLd(coupon: Coupon) {
  const discountText = getDiscountText(coupon.discountType, coupon.discountValue);

  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: `${coupon.merchant.name} - ${discountText}`,
    description: coupon.description,
    priceCurrency: 'USD',
    price: 0,
    priceValidUntil: coupon.endTime,
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: coupon.merchant.name,
    },
    ...(coupon.code && {
      'schema:discountCode': coupon.code,
    }),
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateItemListJsonLd(items: { name: string; url: string }[], listName?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(listName && { name: listName }),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebSiteJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Ecommica',
      url: BASE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/deals?q={search_terms_string}`
        },
        'query-input': 'required name=search_terms_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Ecommica',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      sameAs: [
        'https://twitter.com/ecommica',
        'https://facebook.com/ecommica',
        'https://instagram.com/ecommica'
      ]
    }
  ];
}

export function generateFAQPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateOrganizationJsonLd(contact: { email?: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ecommica',
    url: contact.url,
    logo: `${BASE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: contact.email,
      contactType: 'customer service',
      availableLanguage: ['English', 'Chinese'],
    },
  };
}

interface JsonLdProps {
  data: object;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

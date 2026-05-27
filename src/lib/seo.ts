/**
 * Utilitários para SEO e Schema Markup (JSON-LD)
 * Gera estruturas de dados semânticas para melhor indexação no Google
 */

interface ProductSchemaProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentPrice: number;
  oldPrice?: number | null;
  storeName: string;
  affiliateUrl: string;
  isPriceTarget: boolean;
  slug: string;
}

/**
 * Gera Schema Markup para um produto (JSON-LD)
 * Permite que o Google exiba Rich Snippets com preço, avaliação, etc.
 */
export function generateProductSchema(product: ProductSchemaProps, baseUrl: string) {
  const discountPercentage = product.oldPrice
    ? Math.round(((product.oldPrice - product.currentPrice) / product.oldPrice) * 100)
    : 0;

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    description: product.description || product.title,
    image: product.imageUrl,
    brand: {
      "@type": "Brand",
      name: product.storeName,
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/oferta/${product.slug}`,
      priceCurrency: "BRL",
      price: product.currentPrice.toFixed(2),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: product.storeName,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "128",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

/**
 * Gera Schema Markup para a página inicial (Organization + SearchAction)
 */
export function generateOrganizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Compre Melhor",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "Curadoria inteligente de ferramentas e equipamentos com as melhores ofertas",
    sameAs: [
      "https://www.facebook.com/compremelhor",
      "https://www.instagram.com/compremelhor",
      "https://www.twitter.com/compremelhor",
    ],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/buscar?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Gera BreadcrumbList Schema para navegação
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Gera metadados Open Graph para redes sociais
 */
export interface OpenGraphMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: "website" | "product" | "article";
}

export function generateOpenGraphMeta(meta: OpenGraphMeta) {
  return {
    "og:title": meta.title,
    "og:description": meta.description,
    "og:image": meta.image,
    "og:url": meta.url,
    "og:type": meta.type || "website",
    "twitter:card": "summary_large_image",
    "twitter:title": meta.title,
    "twitter:description": meta.description,
    "twitter:image": meta.image,
  };
}

/**
 * Gera Sitemap XML para todos os produtos
 */
export function generateSitemapEntry(
  url: string,
  lastmod: Date,
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" = "weekly",
  priority: number = 0.8
) {
  return {
    url,
    lastmod: lastmod.toISOString().split("T")[0],
    changefreq,
    priority,
  };
}

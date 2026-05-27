export interface MercadoLivreParsedProduct {
  title: string;
  description: string;
  imageUrl: string;
  currentPrice: number;
  oldPrice: number | null;
  discountPercentage: number | null;
  brand: string | null;
  url: string;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200) || "produto-mercado-livre";
}

export function parsePriceString(value: string | null | undefined): number | null {
  if (!value) return null;
  const cleaned = value
    .trim()
    .replace(/\s+/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.\-]/g, "");

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function getFirstString(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") return value[0];
  return null;
}

function parseJsonLd(html: string): any[] {
  const scripts = Array.from(html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
  const values: any[] = [];
  for (const match of scripts) {
    if (!match[1]) continue;
    try {
      const parsed = JSON.parse(match[1].trim());
      if (Array.isArray(parsed)) {
        values.push(...parsed);
      } else {
        values.push(parsed);
      }
    } catch {
      continue;
    }
  }
  return values;
}

export async function parseMercadoLivreProduct(url: string): Promise<MercadoLivreParsedProduct> {
  const destination = new URL(url, "https://www.mercadolivre.com.br");
  const htmlResponse = await fetch(destination.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });

  const html = await htmlResponse.text();

  const jsonLdBlocks = parseJsonLd(html);
  const productData = jsonLdBlocks.find((item) => {
    if (!item || typeof item !== "object") return false;
    return item["@type"] === "Product" || item["@type"] === "Oferta" || item["@type"] === "Offer";
  }) as any;

  const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title =
    getFirstString(productData?.name) ||
    getFirstString(productData?.title) ||
    (titleMatch ? titleMatch[1] : "Produto Mercado Livre");

  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  const description =
    getFirstString(productData?.description) ||
    (descMatch ? descMatch[1] : "Produto importado do Mercado Livre.");

  const imgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const imageUrl =
    getFirstString(productData?.image) ||
    (imgMatch ? imgMatch[1] : "");

  const priceMatch = html.match(/<meta\s+itemprop="price"\s+content="([^"]+)"/i) || html.match(/<span\s+class="andes-money-amount__fraction">([^<]+)<\/span>/i);
  const rawPrice =
    getFirstString(productData?.offers?.price) ||
    (priceMatch ? priceMatch[1] : null);

  const currentPrice = parsePriceString(rawPrice) || 0;

  const oldPriceMatch = html.match(/<s\s+class="andes-money-amount[^>]*>.*?<span\s+class="andes-money-amount__fraction">([^<]+)<\/span>.*?<\/s>/i);
  const rawOldPrice =
    getFirstString(productData?.offers?.priceSpecification?.price) ||
    (oldPriceMatch ? oldPriceMatch[1] : null);
  const oldPrice = parsePriceString(rawOldPrice);

  const brandMatch = html.match(/<span\s+class="ui-pdp-title__brand">([^<]+)<\/span>/i);
  const brand =
    getFirstString(productData?.brand?.name) ||
    getFirstString(productData?.brand) ||
    (brandMatch ? brandMatch[1] : null);

  const discountPercentage =
    oldPrice && currentPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : null;

  return {
    title: title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
    description: description.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
    imageUrl,
    currentPrice,
    oldPrice,
    discountPercentage,
    brand,
    url: destination.toString(),
  };
}

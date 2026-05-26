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
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });

  if (!htmlResponse.ok) {
    throw new Error(`Falha ao buscar Mercado Livre: ${htmlResponse.status}`);
  }

  const html = await htmlResponse.text();
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  const jsonLdBlocks = parseJsonLd(html);
  const productData = jsonLdBlocks.find((item) => {
    if (!item || typeof item !== "object") return false;
    return item["@type"] === "Product" || item["@type"] === "Oferta" || item["@type"] === "Offer";
  }) as any;

  const title =
    getFirstString(productData?.name) ||
    getFirstString(productData?.title) ||
    document.querySelector("h1.ui-pdp-title")?.textContent?.trim() ||
    document.querySelector("meta[property='og:title']")?.getAttribute("content") ||
    "Produto Mercado Livre";

  const description =
    getFirstString(productData?.description) ||
    document.querySelector("meta[name='description']")?.getAttribute("content") ||
    "Produto importado do Mercado Livre.";

  const imageUrl =
    getFirstString(productData?.image) ||
    document.querySelector("meta[property='og:image']")?.getAttribute("content") ||
    document.querySelector("picture img")?.getAttribute("src") ||
    "";

  const rawPrice =
    getFirstString(productData?.offers?.price) ||
    document.querySelector("meta[itemprop='price']")?.getAttribute("content") ||
    document.querySelector("span.price-tag-fraction")?.textContent ||
    document.querySelector("span.price-tag-symbol")?.textContent;

  const currentPrice = parsePriceString(rawPrice);
  if (currentPrice === null) {
    throw new Error("Não foi possível extrair o preço do produto Mercado Livre.");
  }

  const rawOldPrice =
    getFirstString(productData?.offers?.priceSpecification?.price) ||
    document.querySelector("span.andes-money-amount__fraction")?.textContent ||
    null;
  const oldPrice = parsePriceString(rawOldPrice);

  const brand =
    getFirstString(productData?.brand?.name) ||
    getFirstString(productData?.brand) ||
    document.querySelector("a.ui-pdp-title__brand")?.textContent?.trim() ||
    document.querySelector("span.ui-pdp-title__brand")?.textContent?.trim() ||
    null;

  const discountPercentage =
    oldPrice && currentPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : null;

  return {
    title,
    description,
    imageUrl,
    currentPrice,
    oldPrice,
    discountPercentage,
    brand,
    url: destination.toString(),
  };
}

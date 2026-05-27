import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Força o Next.js a compilar esta rota como dinâmica no servidor
export const dynamic = "force-dynamic";

// Função para criar o slug limpo e único
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    // 1. Verificação extra de segurança: apenas ADMIN pode importar
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado. Sessão expirada ou sem permissões." }, { status: 401 });
    }

    const body = await request.json();
    const rawUrl = String(body?.url || "").trim();

    if (!rawUrl) {
      return NextResponse.json({ error: "Por favor, informe o link do Mercado Livre." }, { status: 400 });
    }

    // Validação básica de domínio para evitar abusos
    const isMLUrl = rawUrl.includes("mercadolivre.com.br") || 
                    rawUrl.includes("mercadolibre.com") || 
                    rawUrl.includes("mlstatic.com") ||
                    rawUrl.includes("mercadolivre.com");
    
    if (!isMLUrl) {
      return NextResponse.json({ error: "A URL informada não parece ser do Mercado Livre." }, { status: 400 });
    }

    let finalUrl = rawUrl;

    // 2. Expandir URL caso seja um link curto de afiliado (ex: /sec/XYZ)
    if (rawUrl.includes('/sec/') || rawUrl.includes('mercadolivre.com.br/p/')) {
      try {
        const expandRes = await fetch(rawUrl, { redirect: 'follow' });
        finalUrl = expandRes.url || rawUrl;
      } catch (e) {
        console.warn("Não foi possível resolver o redirecionamento inicial. Usando URL base.");
      }
    }

    // 3. Extrair a identificação oficial do produto (ID) - Ex: MLB123456789
    let itemId = null;
    try {
      const parsedUrlObj = new URL(finalUrl);
      itemId = parsedUrlObj.searchParams.get("item_id");
    } catch(e) {}
    
    if (!itemId) {
      const itemIdMatch = finalUrl.match(/MLB[-_]?\d+/i);
      itemId = itemIdMatch ? itemIdMatch[0].replace(/[-_]/g, '').toUpperCase() : null;
    }

    if (!itemId) {
      return NextResponse.json({ error: "Não foi possível identificar o código do produto (MLB...) neste link." }, { status: 400 });
    }

    // 4. Buscar os dados via API Pública do Mercado Livre (Bypassa o bloqueio do Datacenter)
    let mlData = null;
    let actualItemId = itemId; // Guardamos o ID real do anúncio caso venha de uma busca
    let catalogName = "";
    let catalogData = null;
    
    // Tentativa A: Buscar como um anúncio direto (Item)
    const itemRes = await fetch(`https://api.mercadolibre.com/items/${itemId}`, { cache: "no-store" });
    if (itemRes.ok) {
      mlData = await itemRes.json();
    } else {
      // Tentativa B: Buscar como produto de catálogo (Product)
      const prodRes = await fetch(`https://api.mercadolibre.com/products/${itemId}`, { cache: "no-store" });
      if (prodRes.ok) {
        catalogData = await prodRes.json();
        catalogName = catalogData.name;
        if (catalogData.buy_box_winner) {
          mlData = {
            id: catalogData.buy_box_winner.item_id,
            title: catalogData.name,
            price: catalogData.buy_box_winner.price,
            original_price: catalogData.buy_box_winner.original_price || null,
            pictures: catalogData.pictures,
            thumbnail: catalogData.pictures?.[0]?.url,
            permalink: catalogData.permalink,
            attributes: catalogData.attributes,
          };
          actualItemId = catalogData.buy_box_winner.item_id;
        }
      }

      // Tentativa C: Busca de anúncios vinculados ao catálogo (Ex: Gift Cards)
      if (!mlData) {
        const searchCatRes = await fetch(`https://api.mercadolibre.com/sites/MLB/search?catalog_product_id=${itemId}`, { cache: "no-store" });
        if (searchCatRes.ok) {
          const searchData = await searchCatRes.json();
          if (searchData.results && searchData.results.length > 0) {
            const bestItem = searchData.results[0];
            actualItemId = bestItem.id;
            
            const bestItemRes = await fetch(`https://api.mercadolibre.com/items/${actualItemId}`);
            if (bestItemRes.ok) {
              mlData = await bestItemRes.json();
            }
          }
        }
      }
      
      // Tentativa D: Busca genérica (Fallback extremo)
      if (!mlData) {
        const searchQuery = catalogName || itemId;
        const searchGenRes = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(searchQuery)}`, { cache: "no-store" });
        if (searchGenRes.ok) {
          const searchData = await searchGenRes.json();
          if (searchData.results && searchData.results.length > 0) {
            const fallbackItem = searchData.results[0];
            actualItemId = fallbackItem.id;
            
            const fallbackItemRes = await fetch(`https://api.mercadolibre.com/items/${actualItemId}`);
            if (fallbackItemRes.ok) {
              mlData = await fallbackItemRes.json();
            }
          }
        }
      }

      // Tentativa E: Extração de Catálogo Forçada (Permite preço 0, não bloqueando a importação)
      if (!mlData && catalogData) {
         mlData = {
            id: catalogData.id,
            title: catalogData.name,
            price: 0,
            original_price: null,
            pictures: catalogData.pictures,
            thumbnail: catalogData.pictures?.[0]?.url,
            permalink: catalogData.permalink,
            attributes: catalogData.attributes,
          };
          actualItemId = catalogData.id;
      }
    }

    // Tentativa F: Web Scraping (Caso a API esteja a bloquear os dados)
    if (!mlData) {
      try {
        const { parseMercadoLivreProduct } = await import("@/lib/mercado-livre");
        const scrapedData = await parseMercadoLivreProduct(finalUrl);
        mlData = {
          id: itemId,
          title: scrapedData.title,
          price: scrapedData.currentPrice || 0,
          original_price: scrapedData.oldPrice || null,
          pictures: [{ secure_url: scrapedData.imageUrl }],
          thumbnail: scrapedData.imageUrl,
          permalink: scrapedData.url,
          attributes: scrapedData.brand ? [{ id: "BRAND", value_name: scrapedData.brand }] : [],
          scrapedDescription: scrapedData.description
        };
      } catch (e) {
        console.warn("Scraping também falhou.");
      }
    }

    // Tentativa G: Resgate Absoluto pela URL (Garante 100% de importação)
    if (!mlData) {
      let fallbackTitle = "Produto Mercado Livre";
      try {
        const urlObj = new URL(finalUrl);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        const rawName = pathSegments[0] !== 'p' ? pathSegments[0] : (pathSegments[1] || "Produto");
        fallbackTitle = rawName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      } catch(e) {}

      mlData = {
        id: itemId,
        title: fallbackTitle,
        price: 0,
        original_price: null,
        pictures: [],
        thumbnail: "",
        permalink: finalUrl,
        attributes: [],
      };
    }

    // 5. Buscar a descrição textual em detalhe (Usando o ID resolvido)
    let description = mlData.scrapedDescription || mlData.title;
    try {
      const descRes = await fetch(`https://api.mercadolibre.com/items/${actualItemId}/description`);
      if (descRes.ok) {
        const descData = await descRes.json();
        description = descData.plain_text || description;
      }
    } catch (e) {
      console.warn("Aviso: Falha ao buscar descrição detalhada.");
    }

    // 6. Tratar a formatação do produto retornado
    const productData = {
      title: mlData.title,
      description: description,
      imageUrl: mlData.pictures?.[0]?.secure_url || mlData.thumbnail || "",
      currentPrice: mlData.price || 0,
      oldPrice: mlData.original_price || null,
      discountPercentage: mlData.original_price && mlData.price < mlData.original_price
        ? Math.round(((mlData.original_price - mlData.price) / mlData.original_price) * 100) 
        : 0,
      url: mlData.permalink,
      brand: mlData.attributes?.find((a: any) => a.id === "BRAND")?.value_name || "Genérica",
    };

    // Garante que a Loja existe no Banco
    const store = await prisma.store.upsert({
      where: { id: "store_mercadolivre" },
      update: {},
      create: {
        id: "store_mercadolivre",
        name: "Mercado Livre",
        logoUrl: "",
        baseUrl: "https://www.mercadolivre.com.br",
        affiliateProgram: "Mercado Livre",
        isActive: true,
      },
    });

    // Garante que uma Categoria base existe
    const category = await prisma.category.upsert({
      where: { slug: "mercado-livre" },
      update: {},
      create: {
        name: "Mercado Livre",
        slug: "mercado-livre",
        description: "Produtos importados automaticamente do Mercado Livre.",
        imageUrl: "",
      },
    });

    // Cria um URL amigável e único
    let productSlug = slugify(productData.title);
    let suffix = 1;
    while (await prisma.product.findUnique({ where: { slug: productSlug } })) {
      productSlug = `${slugify(productData.title)}-${suffix++}`;
    }

    // Guarda a Oferta na sua Base de Dados e preserva a URL de Afiliado original inserida pelo Admin
    const product = await prisma.product.create({
      data: {
        title: productData.title,
        slug: productSlug,
        shortDescription: productData.description.slice(0, 160),
        description: productData.description,
        imageUrl: productData.imageUrl,
        currentPrice: productData.currentPrice,
        oldPrice: productData.oldPrice,
        discountPercentage: productData.discountPercentage,
        affiliateUrl: rawUrl, 
        originalUrl: productData.url,
        brand: productData.brand,
        isPriceTarget: false,
        isActive: true,
        categoryId: category.id,
        storeId: store.id,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("Erro fatal ao importar:", error);
    return NextResponse.json(
      { error: error.message || "Erro inesperado ao comunicar com o servidor do Mercado Livre." },
      { status: 500 }
    );
  }
}

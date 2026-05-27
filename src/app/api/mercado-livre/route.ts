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
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado. Sessão expirada ou sem permissões." }, { status: 401 });
    }

    const body = await request.json();
    const rawUrl = String(body?.url || "").trim();

    if (!rawUrl) {
      return NextResponse.json({ error: "Por favor, informe o link do Mercado Livre." }, { status: 400 });
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
    const itemIdMatch = finalUrl.match(/MLB[-_]?\d+/i);
    const itemId = itemIdMatch ? itemIdMatch[0].replace(/[-_]/g, '').toUpperCase() : null;

    if (!itemId) {
      return NextResponse.json({ error: "Não foi possível identificar o código do produto (MLB...) neste link." }, { status: 400 });
    }

    // 4. Buscar os dados via API Pública do Mercado Livre (Bypassa o bloqueio do Datacenter)
    let mlData = null;
    let actualItemId = itemId; // Guardamos o ID real do anúncio caso venha de uma busca
    
    // Tentativa A: Buscar como um anúncio direto (Item)
    const itemRes = await fetch(`https://api.mercadolibre.com/items/${itemId}`);
    if (itemRes.ok) {
      mlData = await itemRes.json();
    } else {
      // Tentativa B: Buscar como produto de catálogo (Product)
      const prodRes = await fetch(`https://api.mercadolibre.com/products/${itemId}`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.buy_box_winner) {
          mlData = {
            id: prodData.buy_box_winner.item_id,
            title: prodData.name,
            price: prodData.buy_box_winner.price,
            original_price: prodData.buy_box_winner.original_price || null,
            pictures: prodData.pictures,
            thumbnail: prodData.pictures?.[0]?.url,
            permalink: prodData.permalink,
            attributes: prodData.attributes,
          };
          actualItemId = prodData.buy_box_winner.item_id;
        }
      }

      // Tentativa C: Busca de anúncios vinculados ao catálogo (Ex: Gift Cards)
      if (!mlData) {
        const searchCatRes = await fetch(`https://api.mercadolibre.com/sites/MLB/search?catalog_product_id=${itemId}`);
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
        const searchGenRes = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${itemId}`);
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
    }

    if (!mlData) {
      return NextResponse.json({ error: "Este produto não foi encontrado na base de dados oficial do ML ou encontra-se inativo." }, { status: 404 });
    }

    // 5. Buscar a descrição textual em detalhe (Usando o ID resolvido)
    let description = mlData.title;
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
      currentPrice: mlData.price,
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

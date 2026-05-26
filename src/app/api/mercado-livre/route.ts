import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseMercadoLivreProduct, slugify } from "@/lib/mercadoLivre";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = String(body?.url || "").trim();

    if (!rawUrl) {
      return NextResponse.json({ error: "Informe o link do Mercado Livre." }, { status: 400 });
    }

    const parsedUrl = new URL(rawUrl);
    if (!parsedUrl.hostname.includes("mercadolivre.com")) {
      return NextResponse.json({ error: "O link precisa ser do Mercado Livre." }, { status: 400 });
    }

    const productData = await parseMercadoLivreProduct(parsedUrl.toString());

    const store = await prisma.store.upsert({
      where: { id: "store_mercadolivre" },
      update: {
        name: "Mercado Livre",
        baseUrl: "https://www.mercadolivre.com.br",
        affiliateProgram: "Mercado Livre",
      },
      create: {
        id: "store_mercadolivre",
        name: "Mercado Livre",
        logoUrl: "",
        baseUrl: "https://www.mercadolivre.com.br",
        affiliateProgram: "Mercado Livre",
        isActive: true,
      },
    });

    const category = await prisma.category.upsert({
      where: { slug: "mercado-livre" },
      update: {
        description: "Produtos importados automaticamente do Mercado Livre.",
      },
      create: {
        name: "Mercado Livre",
        slug: "mercado-livre",
        description: "Produtos importados automaticamente do Mercado Livre.",
        imageUrl: "",
      },
    });

    let productSlug = slugify(productData.title);
    let suffix = 1;
    while (await prisma.product.findUnique({ where: { slug: productSlug } })) {
      productSlug = `${slugify(productData.title)}-${suffix++}`;
    }

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
        affiliateUrl: productData.url,
        originalUrl: productData.url,
        brand: productData.brand || "",
        isPriceTarget: false,
        isActive: true,
        categoryId: category.id,
        storeId: store.id,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Erro ao importar produto Mercado Livre:", error);
    return NextResponse.json(
      { error: "Não foi possível importar o produto do Mercado Livre." },
      { status: 500 }
    );
  }
}

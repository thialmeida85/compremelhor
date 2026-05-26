import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { trackAndRedirect } from "@/app/actions/trackClick";
import { generateProductSchema } from "@/lib/seo";
import { SchemaMarkup } from "@/components/seo/SchemaMarkup";
import type { Metadata } from "next";

export const revalidate = 60; // Cache de 60 segundos

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { store: true, category: true },
  });

  if (!product || !product.isActive) {
    return {
      title: "Produto não encontrado",
    };
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const keywords = [product.title, product.brand, product.category.name, "oferta", "melhor preço"].filter(
    (item): item is string => Boolean(item)
  );

  return {
    title: `${product.title} | Compre Melhor`,
    description: product.shortDescription || product.description || `Encontre ${product.title} com o melhor preço no Compre Melhor`,
    keywords,
    openGraph: {
      title: product.title,
      description: product.shortDescription || product.description || "Melhor preço garantido",
      images: [product.imageUrl],
      type: "website",
      url: `/oferta/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.shortDescription || product.description || "Melhor preço garantido",
      images: [product.imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  // Busca o produto no banco usando o slug da URL
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { store: true, category: true },
  });

  // Se não achar o produto ou ele estiver inativo, retorna a página 404
  if (!product || !product.isActive) {
    notFound();
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const baseUrl = process.env.NEXTAUTH_URL || "https://compremelhor.com";
  const productSchema = generateProductSchema(
    {
      id: product.id,
      title: product.title,
      description: product.description || product.shortDescription || "",
      imageUrl: product.imageUrl,
      currentPrice: product.currentPrice,
      oldPrice: product.oldPrice,
      storeName: product.store.name,
      affiliateUrl: product.affiliateUrl,
      isPriceTarget: product.isPriceTarget,
      slug: product.slug,
    },
    baseUrl
  );

  return (
    <>
      <SchemaMarkup schema={productSchema} />
      <main className="min-h-screen bg-brand-offwhite py-10 px-6">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            
            {/* Imagem do Produto */}
            <div className="md:w-1/2 p-8 flex items-center justify-center bg-white relative min-h-[300px] border-b md:border-b-0 md:border-r border-gray-100">
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-contain p-8"
              />
            </div>

            {/* Detalhes e Ações */}
            <div className="md:w-1/2 p-8 flex flex-col">
              {product.isPriceTarget && (
                <span className="bg-brand-gold text-brand-black text-xs font-bold px-3 py-1 rounded w-fit mb-4 uppercase tracking-wide">
                  🎯 Preço no Alvo
                </span>
              )}

              <h1 className="text-2xl md:text-3xl font-bold text-brand-graphite mb-2">
                {product.title}
              </h1>

              <p className="text-gray-500 mb-6 flex items-center gap-2">
                Vendido por <strong className="text-brand-black">{product.store.name}</strong>
              </p>

              <div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-100">
                {product.oldPrice && (
                  <p className="text-sm text-gray-400 line-through mb-1">
                    {formatPrice(product.oldPrice)}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-extrabold text-brand-black">
                    {formatPrice(product.currentPrice)}
                  </p>
                  {product.discountPercentage && (
                    <span className="bg-green-100 text-green-800 text-sm font-bold px-2 py-1 rounded">
                      -{product.discountPercentage}%
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-8 text-gray-600 leading-relaxed text-sm">
                <p>{product.shortDescription || product.description}</p>
              </div>

              {/* Botões usando a mesma action de tracking da Home */}
              <div className="mt-auto flex flex-col gap-3">
                <form action={trackAndRedirect.bind(null, product.id, product.affiliateUrl)}>
                  <button type="submit" className="w-full bg-brand-orange text-white font-bold py-4 rounded-lg hover:bg-orange-600 transition shadow-md text-lg">
                    Ver oferta na loja parceira
                  </button>
                </form>
                <button type="button" className="w-full border-2 border-brand-graphite text-brand-graphite font-bold py-3 rounded-lg hover:bg-brand-offwhite transition">
                  ❤️ Salvar para depois
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  Preços e disponibilidade podem mudar sem aviso prévio.<br />
                  Comprando pelos nossos links, podemos receber uma comissão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

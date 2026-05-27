import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { trackAndRedirect } from "@/app/actions/track-click";
import { SaveButton } from "@/components/product/SaveButton";
import { SchemaMarkup } from "@/components/seo/SchemaMarkup";
import { PriceHistory } from "@/components/product/PriceHistory";
import { ChoicePage } from "@/components/product/ChoicePage";

export default async function OfertaPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { store: true, category: true }
  });

  if (!product) {
    notFound();
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": product.imageUrl,
    "description": product.shortDescription || product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Desconhecido"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_APP_URL}/oferta/${product.slug}`,
      "priceCurrency": "BRL",
      "price": product.currentPrice,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": product.store?.name
      }
    }
  };

  return (
    <main className="min-h-screen bg-brand-offwhite py-10 px-6">
      <SchemaMarkup schema={productSchema} />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden p-8 flex flex-col md:flex-row gap-10">
          {/* Imagem */}
          <div className="w-full md:w-1/2 flex items-center justify-center relative min-h-[300px] md:min-h-[400px]">
            <Image 
              src={product.imageUrl} 
              alt={product.title} 
              fill
              className="object-contain" 
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Detalhes */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            {product.isPriceTarget && (
              <span className="bg-brand-gold text-brand-black text-sm font-bold px-3 py-1 rounded w-fit mb-4 uppercase">
                🎯 Preço no Alvo
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-brand-graphite mb-4">{product.title}</h1>
            <p className="text-gray-500 mb-6">Vendido e entregue por: <span className="font-semibold text-brand-graphite">{product.store?.name}</span></p>
            
            <div className="mb-8">
              {product.oldPrice && (
                <p className="text-lg text-gray-400 line-through mb-1">{formatPrice(product.oldPrice)}</p>
              )}
              <p className="text-5xl font-extrabold text-brand-black">{formatPrice(product.currentPrice)}</p>
            </div>

            <form action={trackAndRedirect.bind(null, product.id, product.affiliateUrl)} className="flex flex-col gap-3">
              <button type="submit" className="w-full bg-brand-orange text-white font-bold text-lg py-4 rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-500/30">
                Comprar na loja oficial
              </button>
            </form>
            
            <div className="mt-4">
              <SaveButton product={{ id: product.id, title: product.title, currentPrice: product.currentPrice, oldPrice: product.oldPrice, imageUrl: product.imageUrl, slug: product.slug, storeName: product.store?.name, affiliateUrl: product.affiliateUrl, isPriceTarget: product.isPriceTarget }} />
            </div>
          </div>
        </div>
        
        <ChoicePage 
          productId={product.id}
          productTitle={product.title}
          currentPrice={product.currentPrice}
          affiliateUrl={product.affiliateUrl}
          storeName={product.store?.name || "Loja"}
        />

        <PriceHistory currentPrice={product.currentPrice} />

        {product.description && (
          <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-brand-graphite mb-4">Descrição do Produto</h2>
            <div className="text-gray-700 whitespace-pre-wrap">{product.description}</div>
          </div>
        )}
      </div>
    </main>
  );
}
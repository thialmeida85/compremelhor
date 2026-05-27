import Link from "next/link";
import Image from "next/image";
import { trackAndRedirect } from "@/app/actions/trackClick";
import { SaveButton } from "./SaveButton";

interface ProductProps {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  currentPrice: number;
  oldPrice?: number | null;
  storeName: string;
  affiliateUrl: string;
  isPriceTarget: boolean;
}

export function ProductCard({ product }: { product: ProductProps }) {
  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
      
      {/* Selo Preço no Alvo */}
      {product.isPriceTarget && (
        <span className="bg-brand-gold text-brand-black text-xs font-bold px-2 py-1 rounded w-fit mb-2 uppercase">
          🎯 Preço no Alvo
        </span>
      )}

      {/* Imagem do Produto */}
      <Link href={`/oferta/${product.slug}`} className="relative w-full h-48 mb-4 block group">
        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300">
          <Image 
            src={product.imageUrl} 
            alt={product.title} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain" 
            priority={false}
          />
        </div>
      </Link>

      {/* Informações Básicas */}
      <Link href={`/oferta/${product.slug}`}>
        <h3 className="text-brand-graphite font-semibold text-lg line-clamp-2 mb-1 hover:text-brand-orange transition-colors">
          {product.title}
        </h3>
      </Link>
      <p className="text-sm text-gray-500 mb-4">Vendido por: {product.storeName}</p>

      {/* Preços */}
      <div className="mt-auto mb-4">
        {product.oldPrice && (
          <p className="text-sm text-gray-400 line-through">
            {formatPrice(product.oldPrice)}
          </p>
        )}
        <p className="text-2xl font-bold text-brand-black">
          {formatPrice(product.currentPrice)}
        </p>
      </div>

      {/* Botões CTA */}
      <form action={trackAndRedirect.bind(null, product.id, product.affiliateUrl)} className="flex flex-col gap-2">
        <button 
          type="submit" 
          className="w-full bg-brand-orange text-white font-bold py-3 rounded hover:bg-orange-600 transition"
        >
          Ver oferta
        </button>
      </form>
      
      <div className="mt-2">
        <SaveButton product={product} />
      </div>
      
      {/* Aviso de Transparência Reduzido */}
      <p className="text-[10px] text-gray-400 text-center mt-3">
        Podemos ganhar comissão. Preço sujeito a mudança.
      </p>
    </div>
  );
}

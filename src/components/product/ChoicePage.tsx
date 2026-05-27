"use client";

import { trackAndRedirect } from "@/app/actions/trackClick";
import Image from "next/image";

interface StoreOption {
  name: string;
  price: number;
  url: string;
  logo?: string;
}

export function ChoicePage({ 
  productId, 
  productTitle, 
  currentPrice, 
  affiliateUrl, 
  storeName 
}: { 
  productId: string;
  productTitle: string;
  currentPrice: number;
  affiliateUrl: string;
  storeName: string;
}) {
  // Simulação de outras lojas para demonstração
  // Em produção, isso seria buscado no banco de dados
  const options: StoreOption[] = [
    { 
      name: storeName, 
      price: currentPrice, 
      url: affiliateUrl 
    },
    { 
      name: "Amazon", 
      price: currentPrice * 1.05, 
      url: `https://www.amazon.com.br/s?k=${encodeURIComponent(productTitle)}` 
    },
    { 
      name: "Magazine Luiza", 
      price: currentPrice * 0.98, 
      url: `https://www.magazineluiza.com.br/busca/${encodeURIComponent(productTitle)}` 
    }
  ];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  return (
    <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-8 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-brand-graphite">🛒 Onde Comprar</h2>
        <p className="text-gray-500 text-sm mt-1">Compare preços nas principais lojas parceiras</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {options.map((option, i) => (
          <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400 text-xs">
                {option.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-brand-graphite">{option.name}</p>
                <p className="text-xs text-green-600 font-semibold">Em estoque</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-400 line-through">
                  {formatPrice(option.price * 1.1)}
                </p>
                <p className="text-xl font-bold text-brand-black">
                  {formatPrice(option.price)}
                </p>
              </div>
              
              <form action={trackAndRedirect.bind(null, productId, option.url, `choice_page_${option.name.toLowerCase()}`)}>
                <button 
                  type="submit"
                  className="bg-brand-orange text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600 transition whitespace-nowrap"
                >
                  Ir para loja
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

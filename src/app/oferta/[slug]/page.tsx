"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";

export default function MinhaListaPage() {
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = () => {
      const list = JSON.parse(localStorage.getItem("minhaLista") || "[]");
      setSavedProducts(list);
      setLoading(false);
    };
    
    loadFavorites();
    // Atualiza automaticamente caso o utilizador remova da lista usando outra aba/página
    window.addEventListener("storage", loadFavorites);
    return () => window.removeEventListener("storage", loadFavorites);
  }, []);

  return (
    <main className="min-h-screen bg-brand-offwhite py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-graphite mb-8">Minha Lista de Desejos</h1>
        
        {loading ? (
          <p className="text-gray-500 text-center py-10">Carregando seus favoritos...</p>
        ) : savedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden text-center py-20 px-6">
            <span className="text-6xl mb-4 block">❤️</span>
            <h2 className="text-3xl font-bold text-brand-graphite mb-4">Sua lista está vazia</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Você ainda não salvou nenhum produto para ver depois. Explore nossas ofertas e clique no botão "Salvar para depois" nos produtos que mais gostar!
            </p>
            <Link href="/" className="inline-flex items-center justify-center rounded-2xl bg-brand-orange px-8 py-4 text-white font-bold hover:bg-orange-600 transition">
              Explorar Ofertas
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
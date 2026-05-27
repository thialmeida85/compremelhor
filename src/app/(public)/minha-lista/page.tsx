"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";

interface SavedProduct {
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

export default function MinhaListaPage() {
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar produtos salvos do localStorage
    const savedList = localStorage.getItem("minhaLista");
    if (savedList) {
      try {
        const parsed = JSON.parse(savedList);
        setProducts(parsed);
      } catch (error) {
        console.error("Erro ao carregar lista de favoritos:", error);
        setProducts([]);
      }
    }
    setIsLoading(false);

    // Ouvir mudanças de outras abas/janelas
    const handleStorageChange = () => {
      const updated = localStorage.getItem("minhaLista");
      if (updated) {
        try {
          setProducts(JSON.parse(updated));
        } catch (error) {
          console.error("Erro ao sincronizar lista:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const removeProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    localStorage.setItem("minhaLista", JSON.stringify(updated));
  };

  const clearAll = () => {
    if (confirm("Tem certeza que deseja limpar toda a lista de favoritos?")) {
      setProducts([]);
      localStorage.removeItem("minhaLista");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-brand-offwhite py-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-offwhite py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-brand-graphite mb-2">
              ❤️ Minha Lista de Favoritos
            </h1>
            <p className="text-gray-600">
              {products.length === 0
                ? "Sua lista está vazia"
                : `Você tem ${products.length} produto(s) salvo(s)`}
            </p>
          </div>
          {products.length > 0 && (
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Limpar Tudo
            </button>
          )}
        </div>

        {/* Produtos */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                <button
                  onClick={() => removeProduct(product.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                  title="Remover da lista"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-500 text-lg mb-4">
              Você ainda não salvou nenhum produto
            </p>
            <p className="text-gray-400 mb-6">
              Navegue pelo site e clique no botão "Salvar para depois" para adicionar produtos à sua lista.
            </p>
            <Link
              href="/"
              className="inline-block bg-brand-orange text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
            >
              Voltar à Página Inicial
            </Link>
          </div>
        )}

        {/* Informação sobre Sincronização */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p>
            <strong>ℹ️ Nota:</strong> Seus favoritos são salvos localmente no seu navegador. Para sincronizar entre dispositivos, considere criar uma conta.
          </p>
        </div>
      </div>
    </main>
  );
}

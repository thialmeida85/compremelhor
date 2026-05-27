import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";

export const revalidate = 3600; // Atualiza o cache da página a cada 1 hora

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() || "";

  let products = [];
  let hasSearched = false;

  if (query && query.length >= 2) {
    hasSearched = true;
    products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { store: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  return (
    <main className="min-h-screen bg-brand-offwhite py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho de Busca */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brand-graphite mb-4">
            Resultados de Busca
          </h1>
          <form action="/buscar" method="GET" className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar produtos..."
              className="flex-1 bg-white text-brand-graphite border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition"
            />
            <button
              type="submit"
              className="bg-brand-orange text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Resultados */}
        {hasSearched ? (
          <>
            {products.length > 0 ? (
              <>
                <p className="text-gray-600 mb-6">
                  Encontrados <strong>{products.length}</strong> produto(s) para "{query}"
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        slug: product.slug,
                        title: product.title,
                        imageUrl: product.imageUrl,
                        currentPrice: product.currentPrice,
                        oldPrice: product.oldPrice,
                        storeName: product.store.name,
                        affiliateUrl: product.affiliateUrl,
                        isPriceTarget: product.isPriceTarget,
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <p className="text-gray-500 text-lg mb-4">
                  Nenhum produto encontrado para "{query}"
                </p>
                <p className="text-gray-400 mb-6">
                  Tente usar palavras-chave diferentes ou navegue pelas categorias.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-brand-orange text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
                >
                  Voltar à Página Inicial
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-500 text-lg mb-4">
              Digite pelo menos 2 caracteres para buscar
            </p>
            <Link
              href="/"
              className="inline-block bg-brand-orange text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
            >
              Voltar à Página Inicial
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

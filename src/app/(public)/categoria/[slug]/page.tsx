import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 3600; // Atualiza o cache da página a cada 1 hora

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
    },
    include: { store: true, category: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="min-h-screen bg-brand-offwhite py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-brand-orange transition">
            Início
          </Link>
          <span className="mx-2">/</span>
          <span className="text-brand-graphite font-semibold">{category.name}</span>
        </nav>

        {/* Cabeçalho da Categoria */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {category.imageUrl && (
              <img
                src={category.imageUrl}
                alt={category.name}
                className="h-16 w-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-brand-graphite">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-600 mt-2">{category.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Produtos */}
        {products.length > 0 ? (
          <>
            <p className="text-gray-600 mb-6">
              Mostrando <strong>{products.length}</strong> produto(s) nesta categoria
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
              Nenhum produto disponível nesta categoria no momento
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

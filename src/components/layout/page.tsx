import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: category.id,
    },
    include: { store: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-brand-offwhite py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-graphite mb-2">
          {category.name}
        </h1>
        <p className="text-gray-600 mb-8">Explore as melhores ofertas selecionadas nesta categoria.</p>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, storeName: product.store?.name || "" }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
            <p className="text-gray-600 mb-8">Ainda não temos produtos cadastrados nesta categoria.</p>
            <Link href="/" className="inline-flex items-center justify-center rounded-2xl border border-brand-graphite px-8 py-3 text-brand-graphite font-bold hover:bg-brand-offwhite transition">Voltar ao início</Link>
          </div>
        )}
      </div>
    </main>
  );
}
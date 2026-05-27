import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import ProductActionsDropdown from "@/components/admin/ProductActionsDropdown";

export default async function AdminProdutos({
  searchParams,
}: {
  searchParams?: { query?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const perPage = 10;
  const skip = (currentPage - 1) * perPage;

  const where = query ? { title: { contains: query } } : {};

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { store: true, category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  return (
    <div className="min-h-screen bg-brand-offwhite py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-brand-graphite mb-2">Gerir Produtos</h1>
            <p className="text-gray-600">Listagem de todos os produtos cadastrados.</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin/import"
              className="inline-flex items-center justify-center rounded-2xl bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              📥 Novo Produto
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-brand-graphite bg-white px-6 py-3 text-sm font-semibold text-brand-graphite hover:bg-brand-offwhite transition"
            >
              Voltar
            </Link>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-6 bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
          <form method="GET" className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Buscar produto por nome..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-brand-graphite text-white px-6 py-3 rounded-2xl font-semibold hover:bg-black transition">
                🔍 Buscar
              </button>
              {query && (
                <Link href="/admin/produtos" className="flex items-center justify-center bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition">
                  Limpar
                </Link>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4">Loja</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="h-10 w-10 rounded object-cover border border-gray-200 bg-white" 
                      />
                      <span className="font-medium text-brand-graphite line-clamp-1 max-w-[200px]" title={product.title}>
                        {product.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-graphite">
                      {formatPrice(product.currentPrice)}
                    </td>
                    <td className="px-6 py-4">{product.store?.name || "-"}</td>
                    <td className="px-6 py-4">{product.category?.name || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {product.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ProductActionsDropdown productId={product.id} productSlug={product.slug} />
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      Nenhum produto cadastrado até o momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-500">
                Mostrando <span className="font-medium text-brand-graphite">{totalCount === 0 ? 0 : skip + 1}</span> a <span className="font-medium text-brand-graphite">{Math.min(skip + perPage, totalCount)}</span> de <span className="font-medium text-brand-graphite">{totalCount}</span> produtos
              </span>
              <div className="flex gap-2">
                {currentPage > 1 ? (
                  <Link href={`?query=${query}&page=${currentPage - 1}`} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
                    Anterior
                  </Link>
                ) : (
                  <button disabled className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed bg-gray-50">
                    Anterior
                  </button>
                )}
                {currentPage < totalPages ? (
                  <Link href={`?query=${query}&page=${currentPage + 1}`} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
                    Próxima
                  </Link>
                ) : (
                  <button disabled className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed bg-gray-50">
                    Próxima
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
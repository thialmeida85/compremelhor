import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 60;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const days = parseInt(searchParams.days || "30");
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Buscar cliques por dia
  const clicksByDay = await prisma.eventLog.groupBy({
    by: ["createdAt"],
    where: {
      eventType: "affiliate_click",
      createdAt: { gte: startDate },
    },
    _count: {
      id: true,
    },
  });

  // Agrupar por data (apenas YYYY-MM-DD)
  const clicksMap = new Map<string, number>();
  clicksByDay.forEach((item) => {
    const dateStr = item.createdAt.toISOString().split("T")[0];
    clicksMap.set(dateStr, (clicksMap.get(dateStr) || 0) + item._count.id);
  });

  const sortedClicks = Array.from(clicksMap.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, clicks]) => ({ date, clicks }));

  // Produtos mais clicados
  const topProducts = await prisma.eventLog.groupBy({
    by: ["productId"],
    where: {
      eventType: "affiliate_click",
      productId: { not: null },
      createdAt: { gte: startDate },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 20,
  });

  // Buscar detalhes dos produtos
  const productIds = topProducts
    .map((item) => item.productId)
    .filter(Boolean) as string[];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, slug: true },
  });

  const topProductsWithDetails = topProducts.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      title: product?.title || "Produto desconhecido",
      slug: product?.slug,
      clicks: item._count.id,
    };
  });

  // Lojas com mais cliques
  const topStores = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      store: true,
      _count: {
        select: {
          events: {
            where: {
              eventType: "affiliate_click",
              createdAt: { gte: startDate },
            },
          },
        },
      },
    },
    orderBy: {
      events: {
        _count: "desc",
      },
    },
    take: 20,
  });

  // Agregar cliques por loja
  const storeClicksMap = new Map<string, { storeName: string; clicks: number }>();
  topStores.forEach((product) => {
    const storeId = product.storeId;
    const clicks = product._count.events;
    if (clicks > 0) {
      const current = storeClicksMap.get(storeId);
      storeClicksMap.set(storeId, {
        storeName: product.store.name,
        clicks: (current?.clicks || 0) + clicks,
      });
    }
  });

  const sortedStores = Array.from(storeClicksMap.values())
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // Estatísticas gerais
  const totalClicks = await prisma.eventLog.count({
    where: {
      eventType: "affiliate_click",
      createdAt: { gte: startDate },
    },
  });

  const totalProducts = await prisma.product.count({ where: { isActive: true } });
  const totalUsers = await prisma.user.count();
  const totalStores = await prisma.store.count();

  return (
    <div className="min-h-screen bg-brand-offwhite py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-brand-orange hover:text-orange-600 transition font-semibold mb-4 inline-block"
          >
            ← Voltar ao Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-brand-graphite mb-2">
            📊 Analytics Completos
          </h1>
          <p className="text-gray-600">
            Análise detalhada de cliques e performance dos últimos {days} dias
          </p>
        </div>

        {/* Filtro de Período */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {[7, 30, 90, 180].map((d) => (
            <Link
              key={d}
              href={`/admin/analytics?days=${d}`}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                days === d
                  ? "bg-brand-orange text-white"
                  : "bg-white text-brand-graphite border border-gray-200 hover:border-brand-orange"
              }`}
            >
              {d} dias
            </Link>
          ))}
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 text-sm mb-2">Total de Cliques</p>
            <p className="text-4xl font-bold text-brand-orange">{totalClicks}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 text-sm mb-2">Média por Dia</p>
            <p className="text-4xl font-bold text-brand-gold">
              {Math.round(totalClicks / days)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 text-sm mb-2">Produtos Ativos</p>
            <p className="text-4xl font-bold text-blue-600">{totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 text-sm mb-2">Lojas Parceiras</p>
            <p className="text-4xl font-bold text-purple-600">{totalStores}</p>
          </div>
        </div>

        {/* Gráfico de Cliques por Dia */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-brand-graphite mb-6">
            Cliques por Dia
          </h2>
          <div className="overflow-x-auto">
            <div className="flex gap-1 h-64 items-end min-w-full">
              {sortedClicks.map((item) => {
                const maxClicks = Math.max(...sortedClicks.map((c) => c.clicks), 1);
                const height = (item.clicks / maxClicks) * 100;
                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-brand-orange rounded-t hover:bg-orange-600 transition"
                      style={{ height: `${height}%` }}
                      title={`${item.date}: ${item.clicks} cliques`}
                    />
                    <span className="text-xs text-gray-600 mt-2 truncate">
                      {item.date.split("-").slice(1).join("/")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Produtos Mais Clicados */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-brand-graphite">
                🔥 Top 20 Produtos
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Cliques
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topProductsWithDetails.map((item, index) => (
                    <tr key={item.productId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-orange">
                            #{index + 1}
                          </span>
                          {item.slug ? (
                            <Link
                              href={`/oferta/${item.slug}`}
                              className="text-sm text-brand-graphite hover:text-brand-orange transition truncate"
                            >
                              {item.title}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-600 truncate">
                              {item.title}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-brand-orange">
                        {item.clicks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lojas com Mais Cliques */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-brand-graphite">
                🏪 Top 10 Lojas
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Loja
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Cliques
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedStores.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-orange">
                            #{index + 1}
                          </span>
                          <span className="text-sm text-brand-graphite">
                            {item.storeName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-brand-orange">
                        {item.clicks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

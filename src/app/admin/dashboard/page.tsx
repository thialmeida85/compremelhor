import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 60; // Atualizar a cada 60 segundos

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  try {
    // Buscar estatísticas gerais
    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const totalCategories = await prisma.category.count();
    const totalStores = await prisma.store.count();
    const totalUsers = await prisma.user.count();

    // Buscar cliques nos últimos 7 dias
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentClicks = await prisma.eventLog.count({
      where: {
        eventType: "affiliate_click",
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Produtos mais clicados
    const topProducts = await prisma.eventLog.groupBy({
      by: ["productId"],
      where: {
        eventType: "affiliate_click",
        productId: { not: null },
        createdAt: { gte: sevenDaysAgo },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    });

    // Buscar detalhes dos produtos mais clicados
    const topProductsDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId || "" },
          select: { title: true, slug: true },
        });
        return {
          product,
          clicks: item._count.id,
        };
      })
    );

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
                createdAt: { gte: sevenDaysAgo },
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
      take: 5,
    });

    return (
      <div className="min-h-screen bg-brand-offwhite py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-brand-graphite mb-2">Dashboard Administrativo</h1>
              <p className="text-gray-600">Bem-vindo ao painel de controlo do Compre Melhor</p>
            </div>
            <Link
              href="/admin/import"
              className="inline-flex items-center justify-center rounded-2xl bg-brand-orange px-6 py-3 text-white font-semibold hover:bg-orange-600 transition"
            >
              📥 Incluir produto
            </Link>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Produtos Ativos"
              value={totalProducts}
              icon="📦"
              color="bg-blue-50"
            />
            <StatCard
              title="Categorias"
              value={totalCategories}
              icon="🏷️"
              color="bg-green-50"
            />
            <StatCard
              title="Lojas Parceiras"
              value={totalStores}
              icon="🏪"
              color="bg-purple-50"
            />
            <StatCard
              title="Utilizadores"
              value={totalUsers}
              icon="👥"
              color="bg-orange-50"
            />
          </div>

          {/* Cliques Recentes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-brand-graphite mb-4">Atividade Recente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-brand-offwhite rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Cliques (Últimos 7 dias)</p>
                <p className="text-3xl font-bold text-brand-orange">{recentClicks}</p>
              </div>
              <div className="p-4 bg-brand-offwhite rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Média por Dia</p>
                <p className="text-3xl font-bold text-brand-gold">
                  {Math.round(recentClicks / 7)}
                </p>
              </div>
            </div>
          </div>

          {/* Produtos Mais Clicados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-brand-graphite mb-4">🔥 Produtos Mais Clicados</h2>
              <div className="space-y-3">
                {topProductsDetails.length > 0 ? (
                  topProductsDetails.map((item, index) => (
                    <div
                      key={item.product?.slug}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-brand-orange">#{index + 1}</span>
                        <Link
                          href={`/oferta/${item.product?.slug}`}
                          className="text-brand-graphite hover:text-brand-orange transition font-semibold"
                        >
                          {item.product?.title}
                        </Link>
                      </div>
                      <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-sm font-bold">
                        {item.clicks} cliques
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum clique registado nos últimos 7 dias</p>
                )}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-brand-graphite mb-4">⚡ Ações Rápidas</h2>
              <div className="space-y-3">
                <Link
                  href="/admin/import"
                  className="block w-full p-4 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition text-center"
                >
                  📥 Importar do Mercado Livre
                </Link>
                <Link
                  href="/admin/settings"
                  className="block w-full p-4 bg-brand-graphite text-white rounded-lg font-semibold hover:bg-black transition text-center"
                >
                  ⚙️ Configurações de Conta
                </Link>
                <Link
                  href="/admin/produtos"
                  className="block w-full p-4 bg-brand-gold text-brand-black rounded-lg font-semibold hover:bg-yellow-500 transition text-center"
                >
                  📝 Gerir Produtos
                </Link>
                <Link
                  href="/admin/lojas"
                  className="block w-full p-4 bg-brand-graphite text-white rounded-lg font-semibold hover:bg-black transition text-center"
                >
                  🏪 Gerir Lojas
                </Link>
                <Link
                  href="/admin/analytics"
                  className="block w-full p-4 border-2 border-brand-orange text-brand-orange rounded-lg font-semibold hover:bg-brand-offwhite transition text-center"
                >
                  📊 Ver Analytics Completos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    return (
      <div className="min-h-screen bg-brand-offwhite py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-brand-graphite mb-4">Erro ao Carregar Dashboard</h1>
          <p className="text-gray-600">
            Desculpe, ocorreu um erro ao carregar o dashboard. Por favor, tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`${color} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-brand-graphite">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

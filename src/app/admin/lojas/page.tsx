import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 60;

export default async function LojasPage() {
  // Verificar autenticação
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // Buscar todas as lojas
  const stores = await prisma.store.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-brand-offwhite py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-brand-orange hover:text-orange-600 transition font-semibold mb-4 inline-block"
            >
              ← Voltar ao Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-brand-graphite mb-2">
              Gerir Lojas Parceiras
            </h1>
            <p className="text-gray-600">
              Gerencie as lojas parceiras e seus programas de afiliados
            </p>
          </div>
        </div>

        {/* Tabela de Lojas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {stores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Loja
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Programa de Afiliados
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Produtos
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      URL Base
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {store.logoUrl && (
                            <img
                              src={store.logoUrl}
                              alt={store.name}
                              className="h-8 w-8 rounded object-contain"
                            />
                          )}
                          <span className="font-semibold text-brand-graphite">
                            {store.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {store.affiliateProgram || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-brand-orange">
                        {store._count.products}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            store.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {store.isActive ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <a
                          href={store.baseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-orange hover:text-orange-600 transition"
                        >
                          Visitar →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">Nenhuma loja cadastrada</p>
            </div>
          )}
        </div>

        {/* Informação */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p>
            <strong>ℹ️ Nota:</strong> Para adicionar uma nova loja, entre em contato com o desenvolvedor ou acesse a API diretamente.
          </p>
        </div>
      </div>
    </div>
  );
}

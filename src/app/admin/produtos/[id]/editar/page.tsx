import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { EditProductForm } from "@/components/admin/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // Buscar o produto
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, store: true },
  });

  if (!product) {
    redirect("/admin/produtos");
  }

  return (
    <div className="min-h-screen bg-brand-offwhite py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <Link
            href="/admin/produtos"
            className="text-brand-orange hover:text-orange-600 transition font-semibold mb-4 inline-block"
          >
            ← Voltar para Produtos
          </Link>
          <h1 className="text-4xl font-bold text-brand-graphite mb-2">
            Editar Produto
          </h1>
          <p className="text-gray-600">
            Atualize as informações do produto abaixo
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <EditProductForm product={product} />
        </div>
      </div>
    </div>
  );
}

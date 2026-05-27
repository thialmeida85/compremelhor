import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import EditProductForm from "@/components/admin/EditProductForm";

export default async function EditarProdutoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    redirect("/login");
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    redirect("/admin/produtos");
  }

  return (
    <div className="min-h-screen bg-brand-offwhite py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-brand-graphite mb-2">Editar Produto</h1>
            <p className="text-gray-600">Atualize as informações do produto selecionado.</p>
          </div>
          <Link
            href="/admin/produtos"
            className="inline-flex items-center justify-center rounded-2xl border border-brand-graphite bg-white px-6 py-3 text-sm font-semibold text-brand-graphite hover:bg-brand-offwhite transition"
          >
            Voltar à lista
          </Link>
        </div>

        <EditProductForm product={product} />
      </div>
    </div>
  );
}
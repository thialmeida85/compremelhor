"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  title: string;
  currentPrice: number;
  oldPrice: number | null;
  imageUrl: string;
  affiliateUrl: string;
  isActive: boolean;
};

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = useState({
    title: product.title,
    currentPrice: product.currentPrice,
    oldPrice: product.oldPrice || "",
    imageUrl: product.imageUrl,
    affiliateUrl: product.affiliateUrl,
    isActive: product.isActive,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/admin/produtos/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Falha ao atualizar");

      setStatus({ type: "success", message: "Produto atualizado com sucesso!" });
      router.refresh(); // Solicita ao Next.js a revalidação da rota no servidor
    } catch (error) {
      setStatus({ type: "error", message: "Erro ao atualizar o produto." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Título do Produto</label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-brand-orange focus:outline-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço Atual (R$)</label>
            <input type="number" step="0.01" name="currentPrice" required value={formData.currentPrice} onChange={handleChange} className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-brand-orange focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço Antigo (R$)</label>
            <input type="number" step="0.01" name="oldPrice" value={formData.oldPrice} onChange={handleChange} className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-brand-orange focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
          <input type="url" name="imageUrl" required value={formData.imageUrl} onChange={handleChange} className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-brand-orange focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Link de Afiliado</label>
          <input type="url" name="affiliateUrl" required value={formData.affiliateUrl} onChange={handleChange} className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-brand-orange focus:outline-none" />
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
          <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange" />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
            Produto Ativo (exibir no site)
          </label>
        </div>

        {status && (
          <p className={`text-sm font-medium ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-brand-orange px-6 py-4 text-sm font-bold text-white hover:bg-orange-600 transition disabled:opacity-70"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
}
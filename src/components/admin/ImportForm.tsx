"use client";

import { FormEvent, useState } from "react";

type ImportedProduct = {
  id: string;
  title: string;
  slug: string;
  currentPrice: number;
  oldPrice: number | null;
  imageUrl: string;
  affiliateUrl: string;
};

export default function ImportForm() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ImportedProduct | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProduct(null);
    setError(null);
    setStatus(null);

    if (!url.trim()) {
      setError("Cole o link do Mercado Livre primeiro.");
      return;
    }

    setLoading(true);
    setStatus("Importando produto...");

    try {
      const response = await fetch("/api/mercado-livre", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Falha ao importar o produto.");
        setStatus(null);
        return;
      }

      setProduct(result.product);
      setStatus("Produto importado com sucesso!");
      setUrl("");
    } catch (error) {
      console.error(error);
      setError("Erro inesperado ao importar o produto.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-offwhite py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-10">
          <h1 className="text-4xl font-bold text-brand-graphite mb-4">Incluir produto do Mercado Livre</h1>
          <p className="text-gray-600 mb-8">
            Cole o link do anúncio do Mercado Livre abaixo e o sistema preencherá automaticamente os dados do produto,
            preço, imagem e descrição.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-brand-graphite">
              Link do Mercado Livre
            </label>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.mercadolivre.com.br/...."
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-brand-orange focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-brand-orange px-6 py-3 text-white font-bold hover:bg-orange-600 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Incluindo..." : "Incluir produto"}
            </button>
          </form>

          {status && <p className="mt-4 text-green-600">{status}</p>}
          {error && <p className="mt-4 text-red-600">{error}</p>}

          {product && (
            <section className="mt-10 rounded-3xl border border-gray-200 bg-brand-offwhite p-6">
              <h2 className="text-2xl font-semibold text-brand-graphite mb-4">Produto inserido</h2>
              <div className="grid gap-4 md:grid-cols-[120px_1fr] items-start">
                <img src={product.imageUrl} alt={product.title} className="h-32 w-full rounded-3xl object-cover" />
                <div>
                  <h3 className="text-xl font-bold text-brand-graphite mb-2">{product.title}</h3>
                  <p className="text-gray-600 mb-3">Preço: R$ {product.currentPrice.toFixed(2)}</p>
                  {product.oldPrice !== null && (
                    <p className="text-gray-500 line-through mb-3">Preço antigo: R$ {product.oldPrice.toFixed(2)}</p>
                  )}
                  <a
                    href={`/oferta/${product.slug}`}
                    className="inline-flex rounded-2xl bg-brand-black px-5 py-3 text-white font-semibold hover:bg-gray-900 transition"
                  >
                    Ver no site
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
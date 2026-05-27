import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";

// Otimização: Usar Incremental Static Regeneration (ISR) em vez de force-dynamic
export const revalidate = 3600; // Atualiza o cache da página a cada 1 hora

export default async function Home() {
  try {
    // Busca todos os produtos ativos do banco
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { store: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 12, // Limita a 12 produtos por página
    });

    // Busca todas as categorias
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // Apenas categorias principais
      take: 6,
    });

    return (
      <main className="min-h-screen bg-brand-offwhite">
        {/* Hero Section */}
        <section className="bg-brand-black text-white py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Ferramentas e Equipamentos no <span className="text-brand-orange">Alvo</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl">
              Curadoria inteligente de produtos com as melhores ofertas. Encontre exatamente o que você procura com links diretos para as lojas parceiras.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="#produtos" 
                className="bg-brand-orange text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition text-center"
              >
                Ver Ofertas
              </Link>
              <Link 
                href="#categorias" 
                className="border-2 border-brand-orange text-brand-orange px-8 py-3 rounded-lg font-bold hover:bg-brand-orange hover:text-white transition text-center"
              >
                Explorar Categorias
              </Link>
            </div>
          </div>
        </section>

        {/* Categorias Section */}
        {categories.length > 0 && (
          <section id="categorias" className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-brand-graphite mb-8">Categorias Populares</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categoria/${category.slug}`}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-brand-orange hover:shadow-md transition text-center"
                  >
                    {category.imageUrl && (
                      <div className="mb-3 h-16 flex items-center justify-center">
                        <img 
                          src={category.imageUrl} 
                          alt={category.name}
                          className="max-h-16 object-contain"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-brand-graphite text-sm">
                      {category.name}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Produtos Section */}
        <section id="produtos" className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-graphite mb-8">Ofertas Destacadas</h2>
            
            {products.length > 0 ? (
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
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nenhum produto disponível no momento. Volte em breve!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-brand-black text-white py-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Quer receber notificações de novas ofertas?</h2>
            <p className="text-gray-300 mb-6">
              Acompanhe-nos no WhatsApp para estar sempre atualizado com as melhores promoções.
            </p>
            <Link 
              href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20receber%20notificações%20de%20ofertas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-600 transition"
            >
              Conectar no WhatsApp
            </Link>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error("Erro ao carregar página inicial:", error);
    
    // Fallback: página vazia com mensagem de erro
    return (
      <main className="min-h-screen bg-brand-offwhite">
        <section className="bg-brand-black text-white py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Ferramentas e Equipamentos no <span className="text-brand-orange">Alvo</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl">
              Curadoria inteligente de produtos com as melhores ofertas.
            </p>
          </div>
        </section>
        
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-500 text-lg">
              Desculpe, estamos a carregar os produtos. Por favor, tente novamente em alguns momentos.
            </p>
          </div>
        </section>
      </main>
    );
  }
}

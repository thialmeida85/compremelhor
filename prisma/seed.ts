import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Criar Loja Parceira
  const amazon = await prisma.store.upsert({
    where: { id: 'store_amazon_01' },
    update: {},
    create: {
      id: 'store_amazon_01',
      name: 'Amazon Brasil',
      baseUrl: 'https://www.amazon.com.br',
      affiliateProgram: 'Amazon Associates',
    },
  });

  // 2. Criar Categoria
  const ferramentasEletricas = await prisma.category.upsert({
    where: { slug: 'ferramentas-eletricas' },
    update: {},
    create: {
      name: 'Ferramentas Elétricas',
      slug: 'ferramentas-eletricas',
      description: 'Furadeiras, parafusadeiras, serras e mais equipamentos de potência.',
    },
  });

  // 3. Criar Produto
  await prisma.product.upsert({
    where: { slug: 'parafusadeira-furadeira-impacto-bosch' },
    update: {},
    create: {
      title: 'Parafusadeira e Furadeira de Impacto Bosch GSB 18V-50, 18V',
      slug: 'parafusadeira-furadeira-impacto-bosch',
      shortDescription: 'Motor Brushless, acompanha 2 baterias de 2.0Ah e maleta.',
      imageUrl: 'https://m.media-amazon.com/images/I/61bW6-KzY1L._AC_SX679_.jpg',
      currentPrice: 989.90,
      oldPrice: 1299.00,
      discountPercentage: 23,
      affiliateUrl: 'https://amzn.to/exemplo-link-afiliado',
      originalUrl: 'https://www.amazon.com.br/dp/B085FCRV63',
      brand: 'Bosch',
      isPriceTarget: true,
      categoryId: ferramentasEletricas.id,
      storeId: amazon.id,
    },
  });

  console.log('Seed executado com sucesso! Dados iniciais criados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
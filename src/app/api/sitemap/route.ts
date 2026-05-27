import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "https://compremelhor.com";

    // Buscar todos os produtos ativos
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    // Buscar todas as categorias
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });

    // Gerar XML do sitemap
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Página Principal -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Páginas de Categorias -->
  ${categories
    .map(
      (cat) => `
  <url>
    <loc>${baseUrl}/categoria/${cat.slug}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}

  <!-- Páginas de Produtos -->
  ${products
    .map(
      (prod) => `
  <url>
    <loc>${baseUrl}/oferta/${prod.slug}</loc>
    <lastmod>${prod.updatedAt.toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join("")}
</urlset>`;

    return new NextResponse(sitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Erro ao gerar sitemap:", error);
    return new NextResponse("Erro ao gerar sitemap", { status: 500 });
  }
}

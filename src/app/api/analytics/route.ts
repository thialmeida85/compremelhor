import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Cliques por dia
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

    // Cliques por produto
    const clicksByProduct = await prisma.eventLog.groupBy({
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
      take: 10,
    });

    // Cliques por loja (agregados a partir de eventLog)
    const clicksByProductForStore = await prisma.eventLog.groupBy({
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
      take: 50,
    });

    const productIds = clicksByProductForStore.map((item) => item.productId!);
    const productsForStore = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            storeId: true,
            store: { select: { name: true } },
          },
        })
      : [];

    const storeCountMap = new Map<string, { storeId: string; storeName: string; clicks: number }>();

    for (const productCount of clicksByProductForStore) {
      const product = productsForStore.find((p) => p.id === productCount.productId);
      if (!product) continue;
      const current = storeCountMap.get(product.storeId);
      const clicks = productCount._count.id;

      if (current) {
        current.clicks += clicks;
      } else {
        storeCountMap.set(product.storeId, {
          storeId: product.storeId,
          storeName: product.store.name,
          clicks,
        });
      }
    }

    const clicksByStore = Array.from(storeCountMap.values()).sort((a, b) => b.clicks - a.clicks).slice(0, 10);

    // Estatísticas gerais
    const totalClicks = await prisma.eventLog.count({
      where: {
        eventType: "affiliate_click",
        createdAt: { gte: startDate },
      },
    });

    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      period: `${days} dias`,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      summary: {
        totalClicks,
        totalProducts,
        totalUsers,
        averageClicksPerDay: Math.round(totalClicks / days),
      },
      clicksByDay: clicksByDay.map((item) => ({
        date: item.createdAt.toISOString().split("T")[0],
        clicks: item._count.id,
      })),
      topProducts: clicksByProduct.slice(0, 10),
      topStores: clicksByStore.slice(0, 10),
    });
  } catch (error) {
    console.error("Erro ao obter analytics:", error);
    return NextResponse.json(
      { error: "Erro ao obter analytics" },
      { status: 500 }
    );
  }
}

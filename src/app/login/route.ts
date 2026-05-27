import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, currentPrice, oldPrice, imageUrl, affiliateUrl, isActive } = body;

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        title,
        currentPrice: parseFloat(currentPrice),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        imageUrl,
        affiliateUrl,
        isActive,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}
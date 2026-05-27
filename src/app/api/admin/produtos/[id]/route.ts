import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação e permissão de admin
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem deletar produtos." },
        { status: 401 }
      );
    }

    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório." },
        { status: 400 }
      );
    }

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 }
      );
    }

    // Deletar o produto (em cascata, remove SavedProduct e EventLog associados)
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: "Produto deletado com sucesso.", productId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao deletar produto:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao deletar o produto." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação e permissão de admin
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem editar produtos." },
        { status: 401 }
      );
    }

    const productId = params.id;
    const body = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório." },
        { status: 400 }
      );
    }

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 }
      );
    }

    // Atualizar apenas os campos permitidos
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title: body.title || product.title,
        shortDescription: body.shortDescription || product.shortDescription,
        description: body.description || product.description,
        currentPrice: body.currentPrice ?? product.currentPrice,
        oldPrice: body.oldPrice ?? product.oldPrice,
        imageUrl: body.imageUrl || product.imageUrl,
        affiliateUrl: body.affiliateUrl || product.affiliateUrl,
        brand: body.brand || product.brand,
        isPriceTarget: body.isPriceTarget ?? product.isPriceTarget,
        isActive: body.isActive ?? product.isActive,
      },
    });

    return NextResponse.json(
      { message: "Produto atualizado com sucesso.", product: updatedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar o produto." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateProductComparison } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const {
      product1Title,
      product1Description,
      product1Price,
      product2Title,
      product2Description,
      product2Price,
    } = await request.json();

    // Validar campos obrigatórios
    if (
      !product1Title ||
      !product1Description ||
      !product1Price ||
      !product2Title ||
      !product2Description ||
      !product2Price
    ) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const comparison = await generateProductComparison(
      product1Title,
      product1Description,
      product1Price,
      product2Title,
      product2Description,
      product2Price
    );

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error) {
    console.error("Erro ao comparar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao comparar produtos" },
      { status: 500 }
    );
  }
}

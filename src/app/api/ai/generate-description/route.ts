import { NextRequest, NextResponse } from "next/server";
import { generateOptimizedDescription, generateShortDescription } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const { productTitle, technicalDescription, brand, type } = await request.json();

    if (!productTitle || !technicalDescription) {
      return NextResponse.json(
        { error: "productTitle e technicalDescription são obrigatórios" },
        { status: 400 }
      );
    }

    let result: string;

    if (type === "short") {
      result = await generateShortDescription(productTitle, technicalDescription);
    } else {
      result = await generateOptimizedDescription(
        productTitle,
        technicalDescription,
        brand
      );
    }

    return NextResponse.json({
      success: true,
      description: result,
      type: type || "full",
    });
  } catch (error) {
    console.error("Erro ao gerar descrição:", error);
    return NextResponse.json(
      { error: "Erro ao gerar descrição" },
      { status: 500 }
    );
  }
}

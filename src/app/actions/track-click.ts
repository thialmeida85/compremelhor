"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function trackAndRedirect(
  productId: string,
  affiliateUrl: string,
  source: string = "product_card_cta"
) {
  try {
    // Obter ou criar um session ID anônimo
    const cookieStore = cookies();
    let sessionId = cookieStore.get("anonymous_session_id")?.value;

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      cookieStore.set("anonymous_session_id", sessionId, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    // Registrar o clique no banco de dados
    await prisma.eventLog.create({
      data: {
        eventType: "affiliate_click",
        anonymousSessionId: sessionId,
        productId: productId,
        metadata: {
          source: source,
          userAgent: process.env.NODE_ENV === "production" ? "web" : "development",
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    // Log do erro, mas não bloqueia o redirecionamento
    console.error("Erro ao registrar clique:", error);
  }

  // Redirecionar para o link de afiliado
  redirect(affiliateUrl);
}

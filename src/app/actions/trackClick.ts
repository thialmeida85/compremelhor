"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function trackAndRedirect(productId: string, affiliateUrl: string) {
  const cookieStore = cookies();
  const sessionId = cookieStore.get("anonymous_session_id")?.value || "unknown";
  
  // Registrar o clique de forma assíncrona
  await prisma.eventLog.create({
    data: {
      eventType: "affiliate_click",
      anonymousSessionId: sessionId,
      productId: productId,
      // Em produção, você pegaria o userId do Auth.js caso logado
      metadata: { source: "product_card_cta" }
    }
  });

  // Redirecionar para a URL de afiliado
  redirect(affiliateUrl);
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compre Melhor | Ofertas e Ferramentas no Alvo",
  description: "Curadoria inteligente de ferramentas e equipamentos com links diretos para as melhores lojas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-brand-offwhite min-h-screen flex flex-col`}>
        <Navbar />
        
        <div className="flex-1">
          {children}
        </div>
        
        <footer className="bg-brand-black text-center py-6 text-gray-500 text-sm mt-auto border-t border-brand-graphite">
          <p>© {new Date().getFullYear()} Compre Melhor. Todos os direitos reservados.</p>
          <p className="mt-1 text-xs px-4">Aviso de transparência: recebemos comissão por compras feitas através dos nossos links parceiros.</p>
        </footer>
      </body>
    </html>
  );
}
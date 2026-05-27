"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductActionsDropdown({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fecha o dropdown se o utilizador clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) {
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/admin/produtos/${productId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          router.refresh();
        } else {
          alert("Erro ao excluir o produto.");
        }
      } catch (error) {
        alert("Ocorreu um erro inesperado.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleClone = () => {
    alert("Funcionalidade de clonagem simples será ativada em breve.");
  };

  const handleCloneSEO = () => {
    // Estrutura do prompt preparado para a API do Groq
    const seoPrompt = `Crie um texto de SEO técnico para este produto. 
O título deve ser diferente do original. 
Embase a criação deste texto em uma pesquisa de palavras-chave do Google Trends e nas análises de dados e conversão do site.`;
    
    alert(`Pronto para integrar a clonagem com IA.\n\nPrompt base:\n"${seoPrompt}"`);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-brand-orange transition p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        title="Opções"
      >
        <span className="text-xl">⚙️</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100">
          <div className="py-2">
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium disabled:opacity-50"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </button>
            <Link href={`/admin/produtos/${productId}/editar`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
              Editar
            </Link>
            <button onClick={handleClone} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
              Clonar
            </button>
            <button onClick={handleCloneSEO} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
              Clonar com alteração de textos
            </button>
            <Link href={`/oferta/${productSlug}`} target="_blank" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
              Ver no site
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
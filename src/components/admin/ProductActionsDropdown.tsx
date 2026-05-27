"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function ProductActionsDropdown({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) {
      alert("Funcionalidade de exclusão será ativada em breve na API.");
    }
  };

  const handleCloneSEO = () => {
    alert("Funcionalidade de clonagem com SEO (Groq) será ativada em breve na API.");
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
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100">
          <div className="py-1">
            <Link href={`/oferta/${productSlug}`} target="_blank" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
              👁️ Ver oferta no site
            </Link>
            <Link href={`/admin/produtos/${productId}/editar`} className="block px-4 py-3 text-sm text-brand-orange hover:bg-orange-50 font-medium transition">
              ✏️ Editar Produto
            </Link>
            <button onClick={handleCloneSEO} className="block w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition">
              🤖 Clonar c/ Texto SEO (Groq)
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button onClick={handleDelete} className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition">
              🗑️ Excluir Produto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
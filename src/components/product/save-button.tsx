"use client";

import { useState, useEffect } from "react";

export function save-button({ product }: { product: any }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("minhaLista") || "[]");
    setSaved(list.some((p: any) => p.id === product.id));
  }, [product.id]);

  const toggleSave = () => {
    let list = JSON.parse(localStorage.getItem("minhaLista") || "[]");
    if (saved) {
      list = list.filter((p: any) => p.id !== product.id);
    } else {
      list.push(product);
    }
    localStorage.setItem("minhaLista", JSON.stringify(list));
    setSaved(!saved);
    // Dispara evento para sincronizar com a aba "Minha Lista" se já estiver aberta
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <button 
      type="button" 
      onClick={toggleSave}
      className={`w-full font-semibold py-2.5 rounded-lg transition border-2 ${
        saved 
          ? "border-brand-orange text-brand-orange bg-orange-50 hover:bg-orange-100" 
          : "border-brand-graphite text-brand-graphite hover:bg-brand-offwhite"
      }`}
    >
      {saved ? "❤️ Salvo na lista" : "🤍 Salvar para depois"}
    </button>
  );
}
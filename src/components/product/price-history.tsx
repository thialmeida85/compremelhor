"use client";

import { useEffect, useState } from "react";

interface PricePoint {
  date: string;
  price: number;
}

export function PriceHistory({ currentPrice }: { currentPrice: number }) {
  const [history, setHistory] = useState<PricePoint[]>([]);

  useEffect(() => {
    // Simulação de histórico de preços para demonstração
    // Em produção, isso viria de uma tabela price-history no banco
    const points: PricePoint[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i -= 5) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      // Gerar variação aleatória para o gráfico
      const variation = (Math.random() - 0.5) * (currentPrice * 0.2);
      points.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        price: currentPrice + variation
      });
    }
    
    // O último ponto é sempre o preço atual
    points.push({
      date: 'Hoje',
      price: currentPrice
    });
    
    setHistory(points);
  }, [currentPrice]);

  if (history.length === 0) return null;

  const maxPrice = Math.max(...history.map(h => h.price));
  const minPrice = Math.min(...history.map(h => h.price));
  const range = maxPrice - minPrice || 1;

  return (
    <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brand-graphite">📈 Histórico de Preços</h2>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Últimos 30 dias
        </div>
      </div>
      
      <div className="flex items-end gap-2 h-40 w-full border-b border-gray-100 pb-2">
        {history.map((point, i) => {
          const height = ((point.price - minPrice) / range) * 80 + 20; // Garantir altura mínima de 20%
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative">
              <div 
                className="w-full bg-brand-orange/20 hover:bg-brand-orange transition-colors rounded-t-lg"
                style={{ height: `${height}%` }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-brand-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  R$ {point.price.toFixed(2)}
                </div>
              </div>
              <span className="text-[10px] text-gray-400 mt-2 rotate-45 md:rotate-0">
                {point.date}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
          <p className="text-xs text-green-600 font-bold uppercase mb-1">Menor Preço</p>
          <p className="text-xl font-bold text-green-800">R$ {minPrice.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
          <p className="text-xs text-red-600 font-bold uppercase mb-1">Maior Preço</p>
          <p className="text-xl font-bold text-red-800">R$ {maxPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

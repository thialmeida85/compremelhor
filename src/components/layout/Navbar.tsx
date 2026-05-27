import Link from "next/link";

export function Navbar() {
  return (
    <header className="bg-brand-black border-b border-brand-graphite sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-brand-gold text-2xl">🎯</span>
          <span className="text-white font-extrabold text-xl tracking-tight hidden sm:block">
            Compre<span className="text-brand-orange">Melhor</span>
          </span>
        </Link>

        {/* Barra de Busca (Desktop) */}
        <form action="/buscar" method="GET" className="flex-1 max-w-xl relative hidden md:block">
          <input
            type="text"
            name="q"
            required
            placeholder="Qual ferramenta ou equipamento você procura?"
            className="w-full bg-brand-graphite text-white border border-gray-700 rounded-full py-2 px-4 pr-10 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-orange transition">
            🔍
          </button>
        </form>

        {/* Ações (Lista de Desejos e Login) */}
        <div className="flex items-center gap-4">
          <Link href="/minha-lista" className="text-gray-300 hover:text-white transition flex items-center gap-2 text-sm font-medium">
            <span className="text-lg">❤️</span>
            <span className="hidden sm:block">Minha Lista</span>
          </Link>
          <Link href="/login" className="bg-brand-orange text-white px-4 py-2 rounded font-bold text-sm hover:bg-orange-600 transition">
            Entrar
          </Link>
        </div>
      </div>
      
      {/* Barra de Busca (Mobile) */}
      <form action="/buscar" method="GET" className="md:hidden px-4 pb-3 pt-1">
        <input
          type="text"
          name="q"
          required
          placeholder="Buscar ofertas..."
          className="w-full bg-brand-graphite text-white border border-gray-700 rounded-full py-2 px-4 text-sm focus:outline-none focus:border-brand-orange"
        />
      </form>
    </header>
  );
}
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("E-mail ou senha inválidos. Tente novamente.");
      setIsLoading(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-brand-offwhite px-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-200 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-brand-gold text-4xl">🎯</span>
          </Link>
          <h1 className="text-2xl font-bold text-brand-graphite">Acesso Administrativo</h1>
          <p className="text-gray-500 mt-2 text-sm">Insira as suas credenciais para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition"
              placeholder="admin@compremelhor.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-orange text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-70 mt-2"
          >
            {isLoading ? "A aceder..." : "Entrar no sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}
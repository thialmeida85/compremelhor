"use client";

import { useState } from "react";

export default function change-password-form() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "A nova senha e a confirmação não coincidem." });
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setLoading(false);

    const result = await response.json();
    if (!response.ok) {
      setStatus({ type: "error", message: result.message || "Não foi possível atualizar a senha." });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStatus({ type: "success", message: "Senha atualizada com sucesso." });
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-brand-graphite mb-4">Redefinir senha</h2>
      <p className="text-gray-600 mb-6">Atualize sua senha administrativa com segurança.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Senha atual
          </label>
          <input
            id="currentPassword"
            type="password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Nova senha
          </label>
          <input
            id="newPassword"
            type="password"
            minLength={6}
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirme a nova senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            minLength={6}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
        </div>

        {status ? (
          <p className={`text-sm font-medium ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {status.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-brand-orange px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Atualizando..." : "Atualizar senha"}
        </button>
      </form>
    </div>
  );
}

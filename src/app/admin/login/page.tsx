"use client";

import { useState } from "react";
import { loginAdmin } from "@/app/actions";
import { Lock, ShieldAlert, KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";

function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("from") || "/admin";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAdmin(formData);
      if (!res.success) {
        setError(res.error || "Senha inválida.");
      } else {
        router.push(returnTo);
        router.refresh();
      }
    } catch {
      setError("Ocorreu um erro ao tentar entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl ps2-glass border border-cyan-500/30 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-cyan-400/40 mx-auto flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Acesso Restrito
          </h1>
          <p className="text-xs text-slate-400">
            Digite a senha de administrador configurada para gerenciar a biblioteca de jogos.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center gap-2 text-red-300 text-xs">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Senha de Administrador
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg ps2-glow-button text-white font-semibold text-sm disabled:opacity-50 transition-all"
          >
            {loading ? "Verificando credenciais..." : "Entrar no Painel"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-slate-400 text-xs">Carregando...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}


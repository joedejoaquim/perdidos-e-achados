"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";

import { hasSupabaseConfig } from "@/lib/supabase";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [nextPath, setNextPath] = useState("/dashboard/owner");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const searchParams = new URL(window.location.href).searchParams;
    const next = searchParams.get("next");
    const registered = searchParams.get("registered") === "true";
    const confirmation = searchParams.get("confirmation");
    const queryError = searchParams.get("error");

    if (next?.startsWith("/")) {
      setNextPath(next);
    }

    if (registered) {
      setNotice(
        confirmation === "email"
          ? "Conta criada. Confirme o email enviado pelo Supabase."
          : "Conta criada. Agora faça login."
      );
    }

    if (queryError === "oauth_callback") {
      const msg = searchParams.get("msg");
      setError(msg ? decodeURIComponent(msg) : "Falha no Google Login.");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    if (!hasSupabaseConfig) {
      setError("Configuração Supabase ausente.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || "Erro ao logar");

      router.push(nextPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro no login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setNotice(null);
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", nextPath);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  };

  if (!mounted) return <div className="min-h-screen bg-[#030712]" />;

  return (
    <div className="min-h-screen w-full flex bg-[#030712] overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <m.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/30 blur-[120px]" />
      </div>

      {/* Form Content */}
      <div className="w-full h-full flex items-center justify-center p-6 relative z-10">
        <m.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-[440px]">
          <div className="bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[40px] p-8 sm:p-12 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-6">Login</h2>
            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">{error}</div>}
            {notice && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-xl">{notice}</div>}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none" placeholder="Email" required />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none" placeholder="Senha" required />
              <button disabled={loading} className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all">
                {loading ? "Entrando..." : "Entrar na Conta"}
              </button>
            </form>

            <button onClick={handleGoogleLogin} className="w-full mt-6 py-4 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-all font-bold flex items-center justify-center gap-2">
              Google
            </button>
            
            <p className="mt-8 text-center text-gray-400 text-sm">
              Não tem uma conta? <Link href="/auth/register" className="text-primary font-bold">Criar Agora</Link>
            </p>
          </div>
        </m.div>
      </div>
    </div>
  );
}

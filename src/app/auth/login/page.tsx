"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const next = searchParams.get("next");
    const registered = searchParams.get("registered") === "true";
    const confirmation = searchParams.get("confirmation");
    const queryError = searchParams.get("error");
    const hashError = hashParams.get("error_description");

    if (next?.startsWith("/")) {
      setNextPath(next);
    }

    if (registered) {
      setNotice(
        confirmation === "email"
          ? "Conta criada. Confirme o email enviado pelo Supabase antes de tentar entrar."
          : "Conta criada. Agora faca login para continuar."
      );
    }

    const queryMsg = searchParams.get("msg");
    if (queryError === "oauth_callback") {
      setError(
        queryMsg ? decodeURIComponent(queryMsg) : "Falha ao concluir o login com Google. Confira as Redirect URLs do Supabase para localhost."
      );
    }

    if (hashError) {
      setError(decodeURIComponent(hashError));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    if (!hasSupabaseConfig) {
      setError("Configuracao do Supabase ausente.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Erro ao fazer login");
      }

      router.push(nextPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setNotice(null);

    if (!hasSupabaseConfig) {
      setError("Configuracao do Supabase ausente.");
      return;
    }

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", nextPath);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login com Google");
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  const isConfigMissing = !hasSupabaseConfig;

  return (
    <div className="min-h-screen w-full flex bg-[#030712] overflow-hidden font-sans selection:bg-primary/30 selection:text-primary-foreground">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" 
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px]" 
        />
      </div>

      {/* Left Side: Art & Branding (Hidden on mobile) */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5"
      >
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
              <span className="text-white text-xl font-bold">A</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white group-hover:text-primary transition-colors">ACHADOS</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-7xl font-black text-white leading-[1.1] tracking-tight"
          >
            Sua jornada de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">honestidade</span> começa aqui.
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-xl max-w-md font-light leading-relaxed"
          >
            A plataforma mais segura para devolver o que foi encontrado e ser recompensado.
          </motion.p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-sm text-gray-400 font-medium">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-full border-4 border-[#030712] bg-gray-800 flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
              </div>
            ))}
          </div>
          <span>Junte-se a <span className="text-white font-bold">+2.5k heróis</span> ativos</span>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </motion.div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[440px]"
        >
          <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl rounded-[40px] p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Mobile Branding */}
            <div className="lg:hidden flex justify-center mb-10">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white text-2xl font-bold">A</span>
              </div>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Login</h2>
              <p className="text-gray-400 font-light">Seja bem-vindo novamente.</p>
            </div>

            <AnimatePresence>
              {isConfigMissing && !loading && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-8 p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-4 overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xl">🛠️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-400 mb-1 leading-tight">Configuração Supabase</h4>
                    <p className="text-xs text-orange-300/80 leading-relaxed">
                      Chaves não detectadas. Verifique seu <code>.env.local</code>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            {notice && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm rounded-2xl flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {notice}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email</label>
                <div className="relative group/input">
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.1] text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 placeholder:text-gray-700 group-hover/input:border-white/[0.2]"
                    required
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Senha</label>
                  <Link href="#" className="text-xs text-primary hover:text-orange-400 transition-colors font-bold uppercase tracking-wider">Esqueceu?</Link>
                </div>
                <div className="relative group/input">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.1] text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 placeholder:text-gray-700 group-hover/input:border-white/[0.2]"
                    required
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-orange-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative">
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Entrando...
                    </div>
                  ) : "Entrar na Conta"}
                </span>
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold tracking-[0.3em]">
                <span className="bg-[#0f172a] px-5 text-gray-600">OU</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-bold text-white transition-all hover:bg-white/[0.08] flex items-center justify-center gap-4 group/btn"
            >
              <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continuar com Google</span>
            </button>

            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500 font-medium">
                Não tem uma conta?{" "}
                <Link href="/auth/register" className="text-primary hover:text-orange-400 font-black transition-colors underline underline-offset-4 decoration-primary/20">
                  Criar Agora
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

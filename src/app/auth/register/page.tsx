"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isValidEmail, isValidPhone } from "@/utils/helpers";
import { m } from "framer-motion";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Nome é obrigatório");
    if (!isValidEmail(email)) return setError("Email inválido");
    if (!isValidPhone(phone)) return setError("Telefone inválido");
    if (password.length < 6) return setError("Senha deve ter pelo menos 6 caracteres");
    if (password !== confirmPassword) return setError("Senhas não conferem");

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Erro ao criar conta");

      // Redireciona para o login com flag de sucesso
      // Isso evita loops de auto-login e garante que a sessão seja limpa
      router.push("/auth/login?registered=true&confirmation=email");
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#0a0a0b]" />;

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex overflow-hidden font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <m.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.2, 0.3], x: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/20 rounded-full blur-[120px]" />
        <m.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2], x: [0, -50, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      <div className="flex w-full relative z-10">
        {/* Left Side: Art/Info */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5 bg-black/20 backdrop-blur-3xl">
          <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 tracking-tight">ACHADOS</span>
            </div>
          </m.div>

          <div className="relative z-10 space-y-8">
            <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-6xl font-black text-white leading-tight mb-6 mt-12">
                Comece sua <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-500 to-yellow-500">jornada agora.</span>
              </h1>
              <p className="text-xl text-white/50 max-w-lg font-light leading-relaxed">
                Junte-se à maior comunidade de localização de itens e ajude a conectar o que foi perdido.
              </p>
            </m.div>
          </div>

          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-white/30 text-sm font-light">
            © 2026 Achados Platform. Todos os direitos reservados.
          </m.div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-white mb-2">Criar Conta</h2>
                  <p className="text-white/40 font-light">Preencha os dados abaixo para começar.</p>
                </div>

                {error && (
                  <m.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {error}
                  </m.div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como devemos te chamar?"
                      className="w-full px-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-light"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-light"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Telefone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-light"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Senha</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-light"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Confirmar Senha</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-light"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full group bg-gradient-to-r from-primary to-orange-500 p-0.5 rounded-2xl transition-all hover:shadow-2xl hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    <div className="bg-[#0a0a0b] group-hover:bg-transparent transition-colors rounded-[15px] py-4 flex items-center justify-center font-bold text-white tracking-wide">
                      {loading ? "Criando conta..." : "Criar Conta Agora"}
                    </div>
                  </button>
                </form>

                <div className="mt-12 pt-8 border-t border-white/5 text-center">
                  <p className="text-white/30 font-light">
                    Já tem uma conta?{" "}
                    <Link href="/auth/login" className="text-white font-bold hover:text-primary transition-colors ml-1 underline underline-offset-4 decoration-primary/30">
                      Entrar
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </div>
  );
}

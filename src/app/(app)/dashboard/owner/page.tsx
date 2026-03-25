"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { m } from "framer-motion";
import { formatRelativeTime } from "@/utils/helpers";

type OwnerClaimStatus = "pending" | "accepted" | "in_delivery" | "completed" | "disputed" | "cancelled";
type OwnerPaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

type OwnerDashboardItem = {
  id: string; title: string; description: string; photoUrl: string | null; city: string; state: string; category: string; status: string; rewardValue: number; createdAt: string; updatedAt: string;
  ownerClaim: { id: string; status: OwnerClaimStatus; paymentStatus: OwnerPaymentStatus; createdAt: string; updatedAt: string; } | null;
};

type OwnerDashboardClaim = {
  id: string; itemId: string; status: OwnerClaimStatus; paymentStatus: OwnerPaymentStatus; createdAt: string; updatedAt: string; item: OwnerDashboardItem | null;
};

type OwnerDashboardData = {
  stats: { matchingItems: number; activeClaims: number; protectedRewards: number; completedRecoveries: number; reportedLostItems: number; };
  items: OwnerDashboardItem[];
  activeClaim: OwnerDashboardClaim | null;
  recentClaims: OwnerDashboardClaim[];
};

const CATEGORY_OPTIONS = [
  { value: "all", label: "Todas as categorias" },
  { value: "document", label: "Documento" },
  { value: "electronic", label: "Eletrônico" },
  { value: "key", label: "Chave" },
  { value: "other", label: "Outro" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "available", label: "Disponível" },
  { value: "claimed", label: "Reivindicado" },
  { value: "in_delivery", label: "Em entrega" },
  { value: "delivered", label: "Entregue" },
];

/* Removido constante não utilizada */


function getClaimLabel(status: OwnerClaimStatus) {
  const labels: Record<OwnerClaimStatus, string> = { pending: "Solicitação enviada", accepted: "Aguardando entrega", in_delivery: "Em entrega", completed: "Concluído", disputed: "Em análise", cancelled: "Cancelado" };
  return labels[status] || "Pendente";
}

function getPaymentLabel(status: OwnerPaymentStatus) {
  const labels: Record<OwnerPaymentStatus, string> = { pending: "Aguardando custódia", processing: "Pagamento protegido", completed: "Pagamento concluído", failed: "Falha no pagamento", refunded: "Valor estornado" };
  return labels[status] || "Pendente";
}

/* Removido código não utilizado que causava aviso de build */


/* Removido código não utilizado que causava aviso de build */


/* Removido código não utilizado que causava aviso de build */


export default function OwnerDashboard() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("");
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [_loading, setLoading] = useState(true);
  const [_claimingItemId, setClaimingItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!feedback) return;
    const timeoutId = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  useEffect(() => {
    if (!authUser?.id) return;
    const controller = new AbortController();
    const loadDashboard = async () => {
      try {
        setLoading(true); 
        const requestUrl = new URL("/api/dashboard/owner", window.location.origin);
        if (deferredQuery) requestUrl.searchParams.set("q", deferredQuery);
        if (category !== "all") requestUrl.searchParams.set("category", category);
        if (status !== "all") requestUrl.searchParams.set("status", status);
        if (city.trim()) requestUrl.searchParams.set("city", city.trim());
        const response = await fetch(requestUrl.toString(), { signal: controller.signal });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.data) throw new Error(payload?.error || "Erro ao carregar dashboard");
        setData(payload.data);
      } catch (requestError: unknown) {
        if (requestError instanceof Error && requestError.name === "AbortError") return;
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadDashboard();
    return () => controller.abort();
  }, [authUser?.id, deferredQuery, category, status, city, refreshKey]);

  const handleClaim = async (item: OwnerDashboardItem) => {
    setClaimingItemId(item.id); setFeedback(null);
    try {
      const response = await fetch("/api/claims", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.id, amount: item.rewardValue }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Não foi possível criar a solicitação");
      setFeedback({ type: "success", message: payload?.warning || "Solicitação criada com sucesso." });
      setRefreshKey((c) => c + 1);
    } catch (claimError: unknown) {
      setFeedback({ type: "error", message: claimError instanceof Error ? claimError.message : "Falha ao criar" });
    } finally {
      setClaimingItemId(null);
    }
  };

  if (authLoading || !authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Header user={authUser} hasNotification={Boolean(data?.stats.activeClaims)} />

      <main className="flex flex-1 flex-col md:flex-row max-w-7xl mx-auto w-full">
        <DashboardSidebar />

        <m.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="flex-1 p-6 flex flex-col gap-8 w-full overflow-hidden"
        >
          {feedback && (
            <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-500/20 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 border border-red-500/20 dark:bg-red-500/10 dark:text-red-400'}`}>
              <span className="material-symbols-outlined">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
              {feedback.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatsCard label="Correspondências" value={data?.stats?.matchingItems ?? 0} icon="match_word" color="primary" trend={{ value: 24, isUp: true }} delay={0.1} />
             <StatsCard label="Processos Ativos" value={data?.stats?.activeClaims ?? 0} icon="sync_saved_locally" color="blue" delay={0.2} />
             <StatsCard label="Valores Protegidos" value={`R$ ${data?.stats?.protectedRewards ?? 0}`} icon="security" color="green" delay={0.3} />
             <StatsCard label="Itens Perdidos" value={data?.stats?.reportedLostItems ?? 0} icon="report_gmailerrorred" color="yellow" delay={0.4} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-8">
               <section className="flex flex-col gap-4">
                <div className="relative w-full">
                  <div className="flex w-full items-stretch rounded-xl h-14 shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                    <div className="text-slate-400 flex items-center justify-center pl-4">
                      <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 px-4 text-base outline-none text-slate-900 dark:text-slate-100"
                      placeholder="O que você perdeu? Ex: Chaves de carro BMW, Carteira azul..."
                    />
                    <div className="flex items-center pr-2 gap-2">
                      <button className="bg-primary text-white px-6 h-10 rounded-lg font-bold text-sm">Buscar</button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium">
                    {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium">
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium" />
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                {data?.activeClaim?.item ? (
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl text-primary"><span className="material-symbols-outlined text-3xl">currency_exchange</span></div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Fluxo de Recompensa Seguro</h3>
                          <p className="text-sm text-slate-500">Item: {data.activeClaim.item.title}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
                        <span className="text-sm font-bold text-primary">{getPaymentLabel(data.activeClaim.paymentStatus)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-3">lock_clock</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Nenhuma solicitação em andamento</h3>
                    <p className="text-sm text-slate-500 mt-1">Assim que você solicitar um item, o fluxo de recompensa seguro aparecerá aqui.</p>
                  </div>
                )}
              </section>

              <section className="flex flex-col gap-6">
                <h3 className="text-xl font-bold flex items-center gap-2">Resultados Encontrados</h3>
                {!data?.items.length ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
                    <h3 className="text-lg font-bold">Nenhum item localizado</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.items.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                        <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                          {item.photoUrl && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${item.photoUrl}')` }} />}
                          <div className="absolute top-3 left-3"><span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">KYC OK</span></div>
                          <div className="absolute bottom-3 right-3"><span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">{item.ownerClaim ? getClaimLabel(item.ownerClaim.status) : "DISPONÍVEL"}</span></div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{item.title}</h4>
                          <span className="text-[10px] text-slate-400">{formatRelativeTime(item.createdAt)}</span>
                          <button onClick={() => handleClaim(item)} className="mt-auto w-full py-2 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-xl text-sm font-bold transition-all">Solicitar Reivindicação</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="lg:col-span-4 flex flex-col gap-8">
               <ActivityFeed />
               <div className="bg-gradient-to-br from-primary/10 to-orange-400/5 rounded-3xl p-6 border border-primary/20">
                 <span className="material-symbols-outlined text-4xl text-primary mb-4">shield_with_heart</span>
                 <h4 className="text-xl font-black mb-2">Privacidade Total</h4>
                 <p className="text-sm text-slate-600 dark:text-slate-400">Seus dados só são compartilhados com o localizador após a confirmação do pagamento em custódia.</p>
               </div>
            </aside>
          </div>
        </m.div>
      </main>
    </div>
  );
}

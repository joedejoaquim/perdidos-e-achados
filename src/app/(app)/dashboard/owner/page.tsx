"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { motion } from "framer-motion";
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

const CLAIM_STEP_ORDER = ["pending", "accepted", "in_delivery", "completed"] as const;

function getClaimLabel(status: OwnerClaimStatus) {
  const labels: Record<OwnerClaimStatus, string> = { pending: "Solicitação enviada", accepted: "Aguardando entrega", in_delivery: "Em entrega", completed: "Concluído", disputed: "Em análise", cancelled: "Cancelado" };
  return labels[status] || "Pendente";
}

function getPaymentLabel(status: OwnerPaymentStatus) {
  const labels: Record<OwnerPaymentStatus, string> = { pending: "Aguardando custódia", processing: "Pagamento protegido", completed: "Pagamento concluído", failed: "Falha no pagamento", refunded: "Valor estornado" };
  return labels[status] || "Pendente";
}

function getClaimStepIndex(status: OwnerClaimStatus) {
  const index = CLAIM_STEP_ORDER.indexOf(status as (typeof CLAIM_STEP_ORDER)[number]);
  return index >= 0 ? index : 0;
}

function getLocationLabel(item: { city: string; state: string }) {
  return [item.city, item.state].filter(Boolean).join(", ") || "Local não informado";
}

function ResultCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 group">
      <div className="h-48 bg-slate-100 dark:bg-slate-800 w-full" />
      <div className="space-y-4 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 w-full mt-2" />
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("");
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingItemId, setClaimingItemId] = useState<string | null>(null);
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
      } catch (requestError: any) {
        if (requestError.name === "AbortError") return;
        // console.error(requestError);
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
      if (!response.ok) throw new Error(payload?.error || "Não foi possivel criar a solicitacao");
      setFeedback({ type: "success", message: payload?.warning || "Solicitação criada com sucesso." });
      setRefreshKey((c) => c + 1);
    } catch (claimError: any) {
      setFeedback({ type: "error", message: claimError.message || "Falha ao criar" });
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

        {/* Content Area */}
        <motion.div 
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

          {/* New Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatsCard 
               label="Correspondências" 
               value={data?.stats?.matchingItems ?? 0} 
               icon="match_word" 
               color="primary" 
               trend={{ value: 24, isUp: true }}
               delay={0.1}
             />
             <StatsCard 
               label="Processos Ativos" 
               value={data?.stats?.activeClaims ?? 0} 
               icon="sync_saved_locally" 
               color="blue" 
               delay={0.2}
             />
             <StatsCard 
               label="Valores Protegidos" 
               value={`R$ ${data?.stats?.protectedRewards ?? 0}`} 
               icon="security" 
               color="green" 
               delay={0.3}
             />
             <StatsCard 
               label="Itens Perdidos" 
               value={data?.stats?.reportedLostItems ?? 0} 
               icon="report_gmailerrorred" 
               color="yellow" 
               delay={0.4}
             />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-8">
               {/* Search Section moved here */}
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
                  className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 px-4 text-base placeholder:text-slate-400 outline-none text-slate-900 dark:text-slate-100"
                  placeholder="O que você perdeu? Ex: Chaves de carro BMW, Carteira azul..."
                />
                <div className="flex items-center pr-2 gap-2">
                  {query && (
                    <button onClick={() => setQuery("")} className="p-2 text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined">cancel</span>
                    </button>
                  )}
                  <button className="bg-primary text-white px-6 h-10 rounded-lg font-bold text-sm">Buscar</button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary transition-all cursor-pointer min-w-max">
                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary transition-all cursor-pointer min-w-max">
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary transition-all min-w-max placeholder:text-slate-500" />
            </div>
          </section>

          {/* Active Reward Flow Progress Card */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            {data?.activeClaim?.item ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                      <span className="material-symbols-outlined text-3xl">currency_exchange</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Fluxo de Recompensa Seguro</h3>
                      <p className="text-sm text-slate-500">Item: {data.activeClaim.item.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400">Status Atual:</span>
                    <span className="text-sm font-bold text-primary">{getPaymentLabel(data.activeClaim.paymentStatus)}</span>
                  </div>
                </div>

                <div className="relative mt-8 mb-4">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full"></div>
                  
                  {/* Calculate Progress Bar Width */}
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500" 
                    style={{ width: `${(getClaimStepIndex(data.activeClaim.status) / (CLAIM_STEP_ORDER.length - 1)) * 100}%` }}
                  />
                  
                  <div className="relative flex justify-between">
                    {CLAIM_STEP_ORDER.map((step, index) => {
                      const isActive = index === getClaimStepIndex(data.activeClaim!.status);
                      const isCompleted = index < getClaimStepIndex(data.activeClaim!.status);
                      
                      const icons = ["lock", "description", "check_circle", "handshake"];
                      const labels = ["Pagamento Retido", "Doc. Entregue", "Confirmação", "Liberação"];
                      
                      return (
                        <div key={step} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 px-2 py-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            isActive || isCompleted ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                          } ${isActive ? "ring-4 ring-primary/20 scale-110" : ""}`}>
                            <span className="material-symbols-outlined text-[16px]">{icons[index]}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-tight hidden sm:block ${
                            isActive || isCompleted ? "text-primary" : "text-slate-400"
                          }`}>{labels[index]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>Pagamento protegido em custódia até que você confirme o recebimento do item.</span>
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

          {/* Search Results Grid */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Resultados Encontrados
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{data?.items.length ?? 0} itens</span>
              </h3>
              <div className="flex gap-2">
                <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <ResultCardSkeleton key={i} />)}
              </div>
            ) : !data?.items.length ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4">search_off</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhum item localizado</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1">Tente ajustar seus filtros de busca, reduzir os termos ou verificar outra cidade.</p>
              </div>
            ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {data.items.map((item) => {
                 const canClaim = !item.ownerClaim && item.status === "available";
                 return (
                   <div key={item.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all flex flex-col">
                     <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                       {item.photoUrl ? (
                         <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${item.photoUrl}')` }} />
                       ) : (
                         <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
                           <span className="material-symbols-outlined text-5xl">image_not_supported</span>
                         </div>
                       )}
                       
                       {/* Blure effect for security simulation */}
                       {!item.ownerClaim && <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"></div>}

                       <div className="absolute top-3 left-3 flex gap-2">
                         <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                           <span className="material-symbols-outlined text-[14px]">verified</span> KYC OK
                         </span>
                         {item.rewardValue > 0 && (
                           <span className="bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase">
                             Recompensa: R$ {item.rewardValue}
                           </span>
                         )}
                       </div>
                       <div className="absolute bottom-3 right-3">
                         <span className={`${item.status === 'available' ? 'bg-primary' : 'bg-amber-500'} text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase`}>
                           {item.ownerClaim ? getClaimLabel(item.ownerClaim.status) : (item.status === 'available' ? 'DISPONÍVEL' : 'EM PROCESSO')}
                         </span>
                       </div>
                     </div>
                     <div className="p-4 flex flex-col gap-3 flex-1 opacity-100">
                       <div className="flex justify-between items-start">
                         <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">{item.title}</h4>
                         <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">{formatRelativeTime(item.createdAt)}</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                         <span className="material-symbols-outlined text-[16px]">location_on</span>
                         <span className="truncate">{getLocationLabel(item)}</span>
                       </div>
                       <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                         {item.description || "Descrição do documento não fornecida. KYC verificado."}
                       </p>
                       <div className="mt-auto pt-2">
                         <button
                           disabled={!canClaim || claimingItemId === item.id}
                           onClick={() => handleClaim(item)}
                           className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                             canClaim ? "bg-primary/5 hover:bg-primary text-primary hover:text-white hover:shadow-lg hover:shadow-primary/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent"
                           }`}
                         >
                           {claimingItemId === item.id ? (
                             <><div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /> Processando...</>
                           ) : canClaim ? (
                             "Solicitar Reivindicação"
                           ) : item.ownerClaim ? (
                             <><span className="material-symbols-outlined text-[18px]">verified</span> Em andamento</>
                           ) : (
                             "Indisponível"
                           )}
                         </button>
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
            )}
          </section>
        </div>

        {/* Right Sidebar for Owner */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
           <ActivityFeed />
           
           <div className="bg-gradient-to-br from-primary/10 to-orange-400/5 dark:from-primary/20 dark:to-orange-500/5 rounded-3xl p-6 border border-primary/20 dark:border-primary/30 relative overflow-hidden group">
             <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
             <span className="material-symbols-outlined text-4xl text-primary mb-4">shield_with_heart</span>
             <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Privacidade Total</h4>
             <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Seus dados só são compartilhados com o localizador após a confirmação do pagamento da recompensa em custódia.</p>
             <button className="w-full py-3 bg-white dark:bg-slate-900 border border-primary/30 text-primary font-bold rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all">Ver Contrato de Proteção</button>
           </div>
        </aside>

      </div>
    </motion.div>
  </main>
</div>
  );
}

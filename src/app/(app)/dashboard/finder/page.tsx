"use client";

import React, { useDeferredValue, useEffect, useState } from "react";
import { Activity, LocateFixed, MapPin, Search } from "lucide-react";

import { DocumentsList } from "@/components/dashboard/DocumentsList";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { RegistrationForm } from "@/components/dashboard/RegistrationForm";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { ItemService } from "@/services/item.service";
import { FoundItem } from "@/types";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export default function FinderDashboard() {
  const { user: authUser, loading: authLoading, error: authError } = useAuth();
  const [items, setItems] = useState<FoundItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    if (!authUser?.id) {
      return;
    }

    let cancelled = false;

    const loadItems = async () => {
      try {
        setItemsLoading(true);
        setItemsError(null);

        const nextItems = await ItemService.getItemsByFinder(authUser.id);

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (error) {
        if (!cancelled) {
          setItemsError(
            error instanceof Error ? error.message : "Erro ao carregar dashboard"
          );
        }
      } finally {
        if (!cancelled) {
          setItemsLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      cancelled = true;
    };
  }, [authUser?.id, refreshKey]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light px-4 dark:bg-background-dark">
        <div className="max-w-lg rounded-3xl border border-red-200 bg-white p-8 shadow-sm dark:border-red-500/20 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Nao foi possivel validar sua sessao
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{authError}</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light px-4 dark:bg-background-dark">
        <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Sessao indisponivel
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Faca login novamente para acessar o dashboard do localizador.
          </p>
        </div>
      </div>
    );
  }

  const deliveredCount = items.filter((item) => item.status === "delivered").length;
  const activeRecoveriesCount = items.filter(
    (item) => item.status === "claimed" || item.status === "in_delivery"
  ).length;
  const awaitingOwnerCount = items.filter((item) => item.status === "available").length;
  const filteredItems = deferredSearchQuery
    ? items.filter((item) => {
        const searchable = [
          item.title,
          item.description,
          item.location,
          item.city,
          item.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(deferredSearchQuery.toLowerCase());
      })
    : items;
  const recentCities = Object.entries(
    items.reduce<Record<string, number>>((acc, item) => {
      const location =
        [item.city, item.state].filter(Boolean).join(", ") || "Nao informado";
      acc[location] = (acc[location] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort(([, left], [, right]) => right - left)
    .slice(0, 3);
  const latestLocation = recentCities[0]?.[0] ?? "Sem registros ainda";
  const mapPins = [
    "left-[14%] top-[54%]",
    "right-[18%] top-[24%]",
    "left-[44%] top-[28%]",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-light text-slate-900 transition-colors duration-300 dark:bg-background-dark dark:text-slate-100">
      <Header
        user={authUser}
        hasNotification={activeRecoveriesCount > 0}
        onSearchChange={setSearchQuery}
      />

      <main className="flex flex-1 flex-col max-w-[1440px] mx-auto w-full mb-20">

        <div className="flex-1 p-4 md:p-6 flex flex-col gap-8 w-full overflow-hidden overflow-y-auto">
          {/* Main Grid Wrapper */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            
            {/* Left Column (Stats & Profile) */}
            <div className="flex flex-col gap-6 xl:col-span-4">
              <ProfileCard
                user={authUser}
                totalRegistered={items.length}
                deliveredCount={deliveredCount}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatsCard 
                  label="Total Registrado" 
                  value={itemsLoading ? "..." : items.length} 
                  icon="inventory_2" 
                  color="primary" 
                  delay={0.1}
                  trend={{ value: 12, isUp: true }}
                />
                <StatsCard 
                  label="Devolvidos" 
                  value={itemsLoading ? "..." : deliveredCount} 
                  icon="verified" 
                  color="green" 
                  delay={0.2}
                />
              </div>

              <ActivityFeed />

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Fluxo ativo
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      Panorama do localizador
                    </h3>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Ao vivo
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Em devolucao
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Itens com contato em andamento
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {activeRecoveriesCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Aguardando dono
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Registros disponiveis para busca
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {awaitingOwnerCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-sky-100 p-2 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                        <LocateFixed className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Ultima regiao ativa
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Com base nos seus registros recentes
                        </p>
                      </div>
                    </div>
                    <span className="max-w-[132px] text-right text-sm font-bold text-slate-900 dark:text-white">
                      {latestLocation}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column (List & Maps) */}
            <div className="space-y-8 xl:col-span-8">
              <RegistrationForm onSuccess={() => setRefreshKey((current) => current + 1)} />

              {deferredSearchQuery && (
                <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary dark:border-primary/30 dark:bg-primary/15">
                  Exibindo {filteredItems.length} resultado{filteredItems.length !== 1 ? "s" : ""}{" "}
                  para "{deferredSearchQuery}".
                </div>
              )}

              <DocumentsList
                items={filteredItems}
                isLoading={itemsLoading}
                error={itemsError}
              />

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Localizacoes Recentes
                  </h4>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                    Ao vivo
                  </span>
                </div>

                <div className="grid gap-6 p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.9fr)]">
                  <div className="relative h-52 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(28,116,233,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_34%)]" />
                    <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />

                    {recentCities.length === 0 ? (
                      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 text-center">
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                          <Search className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            Sem localizacoes para exibir
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Os pontos aparecem assim que novos itens forem cadastrados.
                          </p>
                        </div>
                      </div>
                    ) : (
                      recentCities.map(([location, count], index) => (
                        <div
                          key={location}
                          className={`absolute ${mapPins[index] ?? mapPins[mapPins.length - 1]}`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30" />
                          </div>
                          <div className="mt-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur dark:bg-slate-900/90 dark:text-slate-200">
                            {location} - {count}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Cobertura recente
                    </p>
                    <div className="mt-4 space-y-3">
                      {recentCities.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          As cidades dos seus registros vao aparecer aqui.
                        </p>
                      ) : (
                        recentCities.map(([location, count]) => (
                          <div
                            key={location}
                            className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800"
                          >
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                              <MapPin className="h-4 w-4 text-primary" />
                              {location}
                            </span>
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                              {count} registro{count > 1 ? "s" : ""}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-5 rounded-xl bg-primary/5 p-4 dark:bg-primary/10">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                        Fluxo ativo
                      </p>
                      <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                        {activeRecoveriesCount}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        item{activeRecoveriesCount !== 1 ? "s" : ""} com devolucao em andamento
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}

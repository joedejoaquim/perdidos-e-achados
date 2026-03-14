"use client";

import React, { useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/Footer";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RegistrationForm } from "@/components/dashboard/RegistrationForm";
import { DocumentsList } from "@/components/dashboard/DocumentsList";
import { useAuth } from "@/hooks/useAuth";
import { UserService } from "@/services/user.service";
import { ItemService } from "@/services/item.service";
import { User } from "@/types";

export default function FinderDashboard() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalRegistered: 0,
    delivered: 0,
    earnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!authUser?.id) return;

      try {
        setIsLoading(true);

        // Carregar dados do usuário
        const userData = await UserService.getUser(authUser.id);
        setUser(userData);

        // Carregar estatísticas
        const items = await ItemService.getItemsByFinder(authUser.id);
        const delivered = items.filter((item) => item.status === "delivered")
          .length;

        setStats({
          totalRegistered: items.length,
          delivered: delivered,
          earnings: delivered * 80, // 80% de R$100 conforme documentação
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [authUser?.id]);

  if (authLoading || !authUser) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300 flex flex-col">
      <Header user={user || (authUser as any)} />

      <main className="max-w-7xl mx-auto w-full px-4 md:px-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column: Profile + Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Profile Card */}
          <ProfileCard
            user={user!}
            badgesCount={3}
            isLoading={isLoading}
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              label="Total Registrado"
              value={stats.totalRegistered}
              icon="📋"
              color="primary"
            />
            <StatsCard
              label="Devolvidos"
              value={stats.delivered}
              icon="✅"
              color="green"
            />
          </div>
        </div>

        {/* Right Column: Registration + Documents + Map */}
        <div className="lg:col-span-8 space-y-8">
          {/* Registration Form */}
          <RegistrationForm userId={authUser.id} />

          {/* Documents List */}
          <DocumentsList userId={authUser.id} />

          {/* Map Section */}
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Localizações Recentes
              </h4>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                Ao vivo
              </span>
            </div>
            <div className="h-48 relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
              {/* Map Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl mb-2">🗺️</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Mapa interativo
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    (Integrar com Mapbox ou similar)
                  </p>
                </div>
              </div>

              {/* Sample Location Markers */}
              <div className="absolute top-1/2 left-1/3 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center animate-pulse group">
                <div className="w-3 h-3 bg-primary rounded-full" />
              </div>
              <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-primary rounded-full" />
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

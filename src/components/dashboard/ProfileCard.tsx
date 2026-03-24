import React from "react";
import { Lock, Medal, ShieldCheck, Sparkles, Star } from "lucide-react";

import { User } from "@/types";
import { calculateLevel, LEVEL_THRESHOLDS } from "@/utils/helpers";

interface ProfileCardProps {
  deliveredCount?: number;
  isLoading?: boolean;
  totalRegistered?: number;
  user: User;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  deliveredCount = 0,
  isLoading = false,
  totalRegistered = 0,
  user,
}) => {
  if (isLoading || !user) {
    return (
      <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  const currentLevel = calculateLevel(user.xp);
  const levels = ["bronze", "silver", "gold", "platinum", "legend"] as const;
  const currentLevelIndex = levels.indexOf(currentLevel);
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
  const nextLevel = levels[currentLevelIndex + 1];
  const nextThreshold = nextLevel ? LEVEL_THRESHOLDS[nextLevel] : currentThreshold;
  const xpInLevel = Math.max(user.xp - currentThreshold, 0);
  const xpRange = nextLevel ? nextThreshold - currentThreshold : 1;
  const xpToNextLevel = nextLevel ? Math.max(nextThreshold - user.xp, 0) : 0;
  const progressPercentage = nextLevel ? (xpInLevel / xpRange) * 100 : 100;
  const displayLevel = currentLevelIndex + 1;

  const levelLabels: Record<string, string> = {
    bronze: "Heroi dos Documentos",
    silver: "Guardiao Lendario",
    gold: "Protetor de Bens",
    platinum: "Mestre da Devolucao",
    legend: "Lendario da Rede",
  };

  const kycLabel =
    user.kyc_status === "approved"
      ? "Aprovado"
      : user.kyc_status === "pending"
        ? "Em analise"
        : user.kyc_status === "rejected"
          ? "Ajuste necessario"
          : "Nao iniciado";

  const unlockedBadges = [
    {
      bg: "border-amber-200 bg-amber-100 text-amber-600",
      icon: Sparkles,
      key: "first-found",
      label: totalRegistered > 0 ? "Primeiro registro" : "Primeiro registro pendente",
      unlocked: totalRegistered > 0,
    },
    {
      bg: "border-sky-200 bg-sky-100 text-sky-600",
      icon: ShieldCheck,
      key: "verification",
      label:
        user.verified || user.kyc_status === "approved"
          ? "Identidade verificada"
          : "Verificacao pendente",
      unlocked: user.verified || user.kyc_status === "approved",
    },
    {
      bg: "border-emerald-200 bg-emerald-100 text-emerald-600",
      icon: Medal,
      key: "delivered",
      label:
        deliveredCount > 0 ? "Devolucao concluida" : "Primeira devolucao pendente",
      unlocked: deliveredCount > 0,
    },
  ];

  const avatarInitials = user.name
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary to-sky-400 p-1">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={user.name}
                className="h-full w-full rounded-full bg-white object-cover"
                src={user.avatar_url}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-lg font-bold text-primary">
                {avatarInitials}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full border-4 border-white bg-amber-400 p-1 text-white dark:border-slate-900">
            <Star className="h-3.5 w-3.5" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nivel {displayLevel}: {levelLabels[currentLevel]}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Progresso de Nivel
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {nextLevel ? `${xpInLevel}/${xpRange} XP` : `${user.xp} XP`}
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="flex items-center gap-1 text-xs italic text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          {nextLevel
            ? `Faltam ${xpToNextLevel} XP para o selo ${levelLabels[nextLevel]}`
            : "Voce ja atingiu o nivel maximo"}
        </p>
      </div>

      <div className="mt-8">
        <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
          Selos desbloqueados
        </h4>
        <div className="flex flex-wrap gap-3">
          {unlockedBadges.map((badge) => {
            const Icon = badge.icon;

            return (
              <div key={badge.key} className="group relative" title={badge.label}>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-transform hover:scale-105 ${
                    badge.unlocked
                      ? badge.bg
                      : "border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            );
          })}

          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-700 dark:bg-slate-800"
            title="Proximo selo desbloqueavel"
          >
            <Lock className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-800/70">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Conta
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {user.verified ? "Verificada" : "Pendente"}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-800/70">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            KYC
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {kycLabel}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-800/70">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Reputacao
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {user.rating > 0 ? user.rating.toFixed(1) : "Nova"}
          </p>
        </div>
      </div>
    </section>
  );
};

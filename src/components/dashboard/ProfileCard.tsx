import React from "react";
import { User } from "@/types";
import { calculateLevel } from "@/utils/helpers";

interface ProfileCardProps {
  user: User;
  badgesCount?: number;
  isLoading?: boolean;
}

const BADGES = [
  {
    name: "Primeiro Achado",
    emoji: "✨",
    bgColor: "#fef3c7",
    borderColor: "#fcd34d",
  },
  {
    name: "Identidade Verificada",
    emoji: "✓",
    bgColor: "#dbeafe",
    borderColor: "#93c5fd",
  },
  {
    name: "Devolução Concluída",
    emoji: "🤝",
    bgColor: "#dcfce7",
    borderColor: "#86efac",
  },
];

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  isLoading = false,
}) => {
  if (isLoading || !user) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  const currentLevel = calculateLevel(user.xp);
  const xpInLevel = user.xp % 500;
  const xpToNextLevel = 500 - xpInLevel;
  const progressPercentage = (xpInLevel / 500) * 100;

  const getLevelName = (level: string) => {
    const names: Record<string, string> = {
      bronze: "Herói dos Documentos",
      silver: "Guardião Lendário",
      gold: "Protetor de Bens",
      platinum: "Mestre da Devolução",
      legend: "Lendário",
    };
    return names[level] || "Iniciante";
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      {/* Avatar + Name + Level */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-1">
            {user.avatar_url ? (
              <img
                alt={user.name}
                className="w-full h-full rounded-full bg-white object-cover"
                src={user.avatar_url}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-primary text-lg">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
            )}
          </div>
          {(user.kyc_status === "approved" || user.verified) && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white rounded-full p-1 border-4 border-white dark:border-slate-900">
              <span className="text-sm leading-none block">⭐</span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {user.name}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Nível {currentLevel}: {getLevelName(currentLevel)}
          </p>
        </div>
      </div>

      {/* XP Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Progresso de Nível
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {xpInLevel}/1000 XP
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1">
          <span>ℹ️</span>
          Faltam {xpToNextLevel} XP para o selo "Guardião Lendário"
        </p>
      </div>

      {/* Badges */}
      <div className="mt-8">
        <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-400">
          Selos Desbloqueados
        </h4>
        <div className="flex flex-wrap gap-3">
          {BADGES.map((badge, idx) => (
            <div key={idx} className="group relative">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center border-2 cursor-help transition-transform hover:scale-110"
                style={{
                  backgroundColor: badge.bgColor,
                  borderColor: badge.borderColor,
                }}
              >
                <span className="text-lg">{badge.emoji}</span>
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {badge.name}
              </div>
            </div>
          ))}
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 border-2 border-slate-200 dark:border-slate-700">
            <span>🔒</span>
          </div>
        </div>
      </div>
    </div>
  );
};

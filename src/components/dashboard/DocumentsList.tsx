import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Badge,
  ChevronRight,
  Clock3,
  CreditCard,
  History,
  KeyRound,
  Laptop,
  LucideIcon,
  MapPin,
  Package,
} from "lucide-react";

import { FoundItem } from "@/types";

interface DocumentsListProps {
  error?: string | null;
  isLoading?: boolean;
  items: FoundItem[];
}

function getStatusMeta(status: string) {
  const statusMap: Record<
    string,
    {
      actionLabel: string;
      bg: string;
      label: string;
      text: string;
    }
  > = {
    available: {
      actionLabel: "Detalhes",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      label: "Aguardando Proprietario",
      text: "text-yellow-700 dark:text-yellow-400",
    },
    claimed: {
      actionLabel: "Acompanhar",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      label: "Em Devolucao",
      text: "text-blue-700 dark:text-blue-400",
    },
    in_delivery: {
      actionLabel: "Acompanhar",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      label: "Em Entrega",
      text: "text-blue-700 dark:text-blue-400",
    },
    delivered: {
      actionLabel: "Detalhes",
      bg: "bg-green-100 dark:bg-green-900/30",
      label: "Entregue",
      text: "text-green-700 dark:text-green-400",
    },
    closed: {
      actionLabel: "Detalhes",
      bg: "bg-slate-200 dark:bg-slate-800",
      label: "Encerrado",
      text: "text-slate-700 dark:text-slate-300",
    },
  };

  return statusMap[status] || statusMap.available;
}

function getCategoryMeta(category: string): {
  accent: string;
  icon: LucideIcon;
} {
  const categoryMap: Record<string, { accent: string; icon: LucideIcon }> = {
    cnh: { accent: "bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300", icon: Badge },
    cpf: {
      accent: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      icon: Badge,
    },
    credit_card: {
      accent: "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary",
      icon: CreditCard,
    },
    document: {
      accent: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      icon: Badge,
    },
    electronic: {
      accent: "bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
      icon: Laptop,
    },
    key: {
      accent: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
      icon: KeyRound,
    },
    other: {
      accent: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      icon: Package,
    },
    passport: {
      accent: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
      icon: Badge,
    },
  };

  return categoryMap[category] || categoryMap.other;
}

function formatTimeAgo(date: string | Date) {
  const parsedDate = new Date(date);
  const now = new Date();
  const diff = now.getTime() - parsedDate.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return "Agora";
  if (hours < 24) return `${hours}h atras`;
  if (days === 1) return "Ontem";
  return `${days} dias atras`;
}

function getLocationLabel(item: FoundItem) {
  return item.location || [item.city, item.state].filter(Boolean).join(", ") || "Local nao informado";
}

export const DocumentsList: React.FC<DocumentsListProps> = ({
  error,
  isLoading = false,
  items,
}) => {
  const visibleItems = items.slice(0, 3);

  if (isLoading) {
    return (
      <section className="space-y-3">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <History className="h-5 w-5 text-primary" />
            Registros Recentes
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <History className="h-5 w-5 text-primary" />
            Registros Recentes
          </h3>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      </section>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <section className="space-y-3">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <History className="h-5 w-5 text-primary" />
            Registros Recentes
          </h3>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">
            Nenhum item registrado ainda. Cadastre seu primeiro achado para preencher esta lista.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
          <History className="h-5 w-5 text-primary" />
          Registros Recentes
        </h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {visibleItems.length} visiveis
        </span>
      </div>

      <div className="space-y-3">
        {visibleItems.map((item, index) => {
          const statusMeta = getStatusMeta(item.status);
          const categoryMeta = getCategoryMeta(item.category);
          const CategoryIcon = categoryMeta.icon;

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              key={item.id}
              className="group flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${categoryMeta.accent}`}
                >
                  <CategoryIcon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <h4 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {getLocationLabel(item)}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {formatTimeAgo(item.created_at)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusMeta.bg} ${statusMeta.text}`}
                >
                  {statusMeta.label}
                </span>

                {item.description && (
                  <p className="line-clamp-1 max-w-[210px] text-[11px] text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                )}

                <Link
                  href={`/items/${item.id}`}
                  className="text-xs font-bold text-primary opacity-0 transition-opacity hover:underline group-hover:opacity-100"
                >
                  <span className="inline-flex items-center gap-1">
                    {statusMeta.actionLabel}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

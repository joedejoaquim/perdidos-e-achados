import React, { useEffect, useState } from "react";
import { FoundItem } from "@/types";
import { ItemService } from "@/services/item.service";
import Link from "next/link";

interface DocumentsListProps {
  userId: string;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ userId }) => {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const userItems = await ItemService.getItemsByFinder(userId);
        setItems(userItems.slice(0, 3)); // Últimos 3 itens
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar documentos"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [userId]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; label: string }> =
      {
        open: {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-700 dark:text-yellow-400",
          label: "Aguardando Proprietário",
        },
        claimed: {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-700 dark:text-blue-400",
          label: "Em Devolução",
        },
        delivered: {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-700 dark:text-green-400",
          label: "Entregue",
        },
      };

    return colors[status] || colors.open;
  };

  const getStatusIcon = (category: string) => {
    const icons: Record<string, string> = {
      document: "📋",
      cpf: "🆔",
      cnh: "🚗",
      credit_card: "💳",
      passport: "📕",
      other: "📦",
    };
    return icons[category] || "📝";
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Agora";
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return "Ontem";
    return `${days} dias atrás`;
  };

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span>⏱️</span>
            Registros Recentes
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
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
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span>⏱️</span>
            Registros Recentes
          </h3>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">
            ❌ Erro ao carregar documentos
          </p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span>⏱️</span>
            Registros Recentes
          </h3>
        </div>
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 text-sm">
            Nenhum documento registrado ainda. Registre seu primeiro documento!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span>⏱️</span>
          Registros Recentes
        </h3>
        <Link
          href="/search"
          className="text-sm font-bold text-primary hover:underline"
        >
          Ver Todos →
        </Link>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const statusColor = getStatusColor(item.status);

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: [
                      "bg-slate-100",
                      "bg-primary/10",
                      "bg-green-100",
                    ][Math.floor(Math.random() * 3)],
                  }}
                >
                  {getStatusIcon(item.category)}
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-sm line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      📍 {item.location || "Localização não informada"}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 ${statusColor.bg} ${statusColor.text} text-[10px] font-bold rounded-full uppercase tracking-wider`}
                >
                  {statusColor.label}
                </span>

                {item.status === "delivered" && (
                  <p className="text-[10px] font-bold text-green-600">
                    ✅ +50 XP Ganhos
                  </p>
                )}

                <Link
                  href={`/items/${item.id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  Detalhes →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

'use client';

import React, { useEffect, useState, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Activity {
  id: string;
  type: 'found' | 'joined' | 'reward';
  user: string;
  item?: string;
  location?: string;
  timestamp: string;
}

// Separate Item component with memoization to avoid redundant re-renders
const ActivityItem = memo(({ act }: { act: Activity }) => {
  return (
    <m.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative flex items-start gap-3 p-3 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-default"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner border border-white/20 transition-transform group-hover:scale-110 duration-300">
        <span className="material-symbols-outlined text-[20px]">
          {act.type === 'found' ? 'package_2' : act.type === 'joined' ? 'person_add' : 'payments'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {act.user} <span className="font-medium text-slate-500 dark:text-slate-400">
              {act.type === 'found' ? 'registrou um novo achado' : act.type === 'joined' ? 'entrou na plataforma' : 'recebeu uma recompensa'}
            </span>
          </p>
          <span className="text-[9px] font-medium text-slate-400 shrink-0 transform-gpu group-hover:-translate-x-1 duration-300">{act.timestamp}</span>
        </div>
        {act.item && (
           <p className="text-[11px] font-black text-primary mt-0.5 group-hover:tracking-wide duration-300">
             {act.item}
           </p>
        )}
        {act.location && (
          <div className="flex items-center gap-1 mt-1 opacity-60 group-hover:opacity-100 duration-300">
            <span className="material-symbols-outlined text-[12px] text-slate-400">location_on</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{act.location}</span>
          </div>
        )}
      </div>
    </m.div>
  );
});

ActivityItem.displayName = "ActivityItem";

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!supabase) {
          console.warn("Supabase client not initialized in ActivityFeed");
          setLoading(false);
          return;
        }

        const { data: items, error: itemsError } = await supabase
          .from('found_items')
          .select('id, title, city, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (itemsError) {
          console.error("Supabase Error in ActivityFeed:", itemsError.message, itemsError.details);
          setLoading(false);
          return;
        }

        if (!items) {
          setActivities([]);
          setLoading(false);
          return;
        }

        const mappedItems: Activity[] = items.map(item => ({
          id: item.id,
          type: 'found',
          user: 'Usuário',
          item: item.title,
          location: item.city,
          timestamp: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        setActivities(mappedItems);
      } catch (err: unknown) {
        console.error("Unexpected Error fetching activities:", {
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
          raw: err
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    const subscription = supabase
      .channel('public:found_items')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'found_items' }, (payload) => {
        const newAct: Activity = {
          id: payload.new.id,
          type: 'found',
          user: 'Novo registro',
          item: payload.new.title,
          location: payload.new.city,
          timestamp: 'Agora'
        };
        setActivities(prev => [newAct, ...prev].slice(0, 5));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Hub de Atividades REAIS
        </h3>
        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400 uppercase">Tempo Real</span>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <span className="material-symbols-outlined animate-spin text-primary">sync</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {activities.length > 0 ? (
                activities.map((act) => <ActivityItem key={act.id} act={act} />)
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">Sem atividades recentes.</div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none rounded-3xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
    </div>
  );
};


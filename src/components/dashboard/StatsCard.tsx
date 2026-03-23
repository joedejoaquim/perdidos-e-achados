'use client';

import React, { memo } from "react";
import { m } from "framer-motion";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color: "primary" | "green" | "blue" | "yellow" | "red";
  delay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = memo(({
  label,
  value,
  icon,
  trend,
  color,
  delay = 0
}) => {
  const colorMap = {
    primary: "from-blue-500/20 to-indigo-500/5 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20 icon-bg-blue-500/10",
    green: "from-emerald-500/20 to-teal-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20 icon-bg-emerald-500/10",
    blue: "from-sky-500/20 to-blue-500/5 text-sky-600 dark:text-sky-400 border-sky-200/50 dark:border-sky-500/20 icon-bg-sky-500/10",
    yellow: "from-amber-500/20 to-yellow-500/5 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20 icon-bg-amber-500/10",
    red: "from-rose-500/20 to-red-500/5 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20 icon-bg-rose-500/10",
  };

  return (
    <m.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all group`}
    >
      {/* Background Glow */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl rounded-full bg-gradient-to-br ${colorMap[color]} opacity-30`} />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {value}
            </h3>
            {trend && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${trend.isUp ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                <span className="material-symbols-outlined text-[12px]">{trend.isUp ? 'trending_up' : 'trending_down'}</span>
                {trend.value}%
              </span>
            )}
          </div>
        </div>

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/20 transition-transform group-hover:scale-110 duration-300`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <m.div 
          initial={{ width: 0 }}
          animate={{ width: "70%" }}
          transition={{ duration: 0.8, delay: delay + 0.3 }}
          className={`h-full bg-gradient-to-r from-primary to-orange-400 rounded-full`} 
        />
      </div>
    </m.div>
  );
});

StatsCard.displayName = "StatsCard";


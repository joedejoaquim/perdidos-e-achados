import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: "primary" | "green" | "blue" | "yellow" | "red";
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  color,
}) => {
  const colorClasses: Record<string, string> = {
    primary:
      "text-primary dark:text-blue-400 border-primary/20 dark:border-blue-500/20",
    green:
      "text-green-500 dark:text-green-400 border-green-200 dark:border-green-900/30",
    blue:
      "text-blue-500 dark:text-blue-400 border-blue-200 dark:border-blue-900/30",
    yellow:
      "text-yellow-500 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30",
    red: "text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/30",
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 ${colorClasses[color]}`}>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {label}
      </p>
      <div className="flex items-end gap-2 mt-2">
        <p className={`text-2xl font-black ${colorClasses[color]}`}>
          {value}
        </p>
        <span className="text-2xl mb-1">{icon}</span>
      </div>
    </div>
  );
};

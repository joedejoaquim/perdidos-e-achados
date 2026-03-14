'use client';

interface StatsMetricsProps {
  reputation?: number;
  reputationCount?: number;
  rewardsAmount?: string;
  rewardsPercentage?: number;
  rankingPosition?: number;
  rankingBadge?: string;
}

export default function StatsMetrics({
  reputation = 4.9,
  reputationCount = 128,
  rewardsAmount = 'R$ 1.240',
  rewardsPercentage = 12,
  rankingPosition = 42,
  rankingBadge = 'Ouro',
}: StatsMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Reputation Card */}
      <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
          Reputação
        </p>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-slate-900 dark:text-slate-100">
            {reputation}
          </span>
          <div className="flex pb-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`material-symbols-outlined text-lg ${
                  i < 4 ? 'text-yellow-400' : 'text-yellow-400/40'
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Baseado em {reputationCount} feedbacks
        </p>
      </div>

      {/* Rewards Card */}
      <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
          Recompensas
        </p>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-black text-slate-900 dark:text-slate-100">
            {rewardsAmount}
          </span>
          <span className="text-green-500 text-sm font-bold pb-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            {`+${rewardsPercentage}%`}
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Ganhos totais como localizador
        </p>
      </div>

      {/* Ranking Card */}
      <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
          Ranking Global
        </p>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-slate-900 dark:text-slate-100">
            #{rankingPosition}
          </span>
          <div className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1">
            {rankingBadge}
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Top 1% da região sul
        </p>
      </div>
    </div>
  );
}

'use client';

export interface Badge {
  id: string;
  icon: string;
  label: string;
  color: 'primary' | 'yellow' | 'green' | 'slate';
  unlocked: boolean;
}

interface BadgesHonorProps {
  badges?: Badge[];
  nextLevel?: string;
  progressPercentage?: number;
}

const defaultBadges: Badge[] = [
  {
    id: 'verified',
    icon: 'verified',
    label: 'Verificado',
    color: 'primary',
    unlocked: true,
  },
  {
    id: 'gold',
    icon: 'emoji_events',
    label: 'Ouro',
    color: 'yellow',
    unlocked: true,
  },
  {
    id: 'honest',
    icon: 'volunteer_activism',
    label: 'Honesto',
    color: 'green',
    unlocked: true,
  },
  {
    id: 'pioneer',
    icon: 'rocket_launch',
    label: 'Pioneiro',
    color: 'slate',
    unlocked: false,
  },
];

const getBadgeColorClass = (color: string, unlocked: boolean) => {
  if (!unlocked) {
    return 'bg-slate-100 dark:bg-slate-800 text-slate-400 grayscale hover:grayscale-0 hover:bg-primary/10 hover:text-primary';
  }

  switch (color) {
    case 'primary':
      return 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white';
    case 'yellow':
      return 'bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white';
    case 'green':
      return 'bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
  }
};

export default function BadgesHonor({
  badges = defaultBadges,
  nextLevel = 'Platina',
  progressPercentage = 80,
}: BadgesHonorProps) {
  return (
    <div className="bg-white dark:bg-background-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
      <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Badges de Honra
      </h3>

      {/* Badges Grid */}
      <div className="grid grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`flex flex-col items-center gap-2 group cursor-pointer transition-all ${
              !badge.unlocked && 'opacity-30 hover:opacity-100'
            }`}
          >
            <div
              className={`size-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-all ${getBadgeColorClass(badge.color, badge.unlocked)}`}
            >
              <span
                className="material-symbols-outlined text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {badge.icon}
              </span>
            </div>
            <span className="text-[10px] font-bold text-center uppercase tracking-tighter text-slate-700 dark:text-slate-300">
              {badge.label}
            </span>
          </div>
        ))}
      </div>

      {/* Next Level Progress */}
      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Próximo Nível: {nextLevel}
          </p>
          <p className="text-xs font-bold text-primary">{progressPercentage}%</p>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

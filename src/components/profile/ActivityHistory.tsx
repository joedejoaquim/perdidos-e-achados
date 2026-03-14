'use client';

export interface ActivityItem {
  id: string;
  type: 'reward' | 'item' | 'badge';
  title: string;
  description: string;
  value: string;
  date: string;
  icon: string;
}

interface ActivityHistoryProps {
  activities?: ActivityItem[];
  onViewAll?: () => void;
}

const defaultActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'reward',
    title: 'Recompensa Recebida',
    description: 'MacBook Pro - Devolução em Curitiba',
    value: 'R$ 500,00',
    date: '12 Mai, 2024',
    icon: 'payments',
  },
  {
    id: '2',
    type: 'item',
    title: 'Novo Item Localizado',
    description: 'Chaves de carro - Shopping Estação',
    value: 'Status: Validando',
    date: '08 Mai, 2024',
    icon: 'package_2',
  },
  {
    id: '3',
    type: 'badge',
    title: 'Badge Conquistada',
    description: 'Localizador Ouro - 10 Devoluções com sucesso',
    value: '+100 XP',
    date: '01 Mai, 2024',
    icon: 'stars',
  },
];

const getIconColor = (type: string) => {
  switch (type) {
    case 'reward':
      return 'bg-green-100 dark:bg-green-900/30 text-green-600';
    case 'item':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
    case 'badge':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600';
  }
};

const getValueColor = (type: string) => {
  switch (type) {
    case 'reward':
      return 'text-slate-900 dark:text-slate-100';
    case 'item':
      return 'text-slate-900 dark:text-slate-100';
    case 'badge':
      return 'text-primary';
    default:
      return 'text-slate-900 dark:text-slate-100';
  }
};

export default function ActivityHistory({
  activities = defaultActivities,
  onViewAll,
}: ActivityHistoryProps) {
  return (
    <div className="bg-white dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Histórico de Atividades
        </h2>
        <button
          onClick={onViewAll}
          className="text-primary text-sm font-bold hover:underline transition-colors"
        >
          Ver tudo
        </button>
      </div>

      {/* Activities List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`size-12 rounded-lg ${getIconColor(activity.type)} flex items-center justify-center flex-shrink-0`}
              >
                <span className="material-symbols-outlined">{activity.icon}</span>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {activity.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activity.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-black text-sm ${getValueColor(activity.type)}`}>
                {activity.value}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">
                {activity.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

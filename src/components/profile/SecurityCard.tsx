'use client';

interface SecurityItem {
  icon: string;
  label: string;
  statusLabel: string;
  statusColor: 'green' | 'blue' | 'amber';
}

interface SecurityCardProps {
  securityItems?: SecurityItem[];
}

const defaultSecurityItems: SecurityItem[] = [
  {
    icon: 'check_circle',
    label: 'Verificação KYC',
    statusLabel: 'Completo',
    statusColor: 'green',
  },
  {
    icon: 'verified_user',
    label: 'LGPD Compliance',
    statusLabel: 'Ativo',
    statusColor: 'green',
  },
  {
    icon: 'lock',
    label: 'Criptografia',
    statusLabel: 'AES-256',
    statusColor: 'blue',
  },
];

export default function SecurityCard({
  securityItems = defaultSecurityItems,
}: SecurityCardProps) {
  const getStatusColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-500';
      case 'blue':
        return 'text-blue-500';
      case 'amber':
        return 'text-amber-500';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
        <span className="material-symbols-outlined text-primary">security</span>
        Segurança
      </h3>
      <div className="space-y-4">
        {securityItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span
                className={`material-symbols-outlined text-lg ${getStatusColorClass(item.statusColor)} font-bold`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.icon}
              </span>
              {item.label}
            </span>
            <span className={`font-bold ${getStatusColorClass(item.statusColor)}`}>
              {item.statusLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [messageCount] = useState(3);

  const menuGroups = [
    {
      label: 'Proprietário',
      items: [
        { icon: 'dashboard', label: 'Painel de Busca', href: '/dashboard/owner' },
      ],
    },
    {
      label: 'Localizador',
      items: [
        { icon: 'location_on', label: 'Painel de Resgate', href: '/dashboard/finder' },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { icon: 'chat_bubble', label: 'Mensagens', href: '/dashboard/messages', badge: messageCount },
        { icon: 'verified_user', label: 'Verificação KYC', href: '/dashboard/kyc' },
        { icon: 'settings', label: 'Configurações', href: '/dashboard/settings' },
      ],
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname !== '/dashboard') return false;
    return pathname === href;
  };

  return (
    <aside className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 px-2">
        <h1 className="text-slate-900 dark:text-slate-100 text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">travel_explore</span>
          Portal Achados
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Alterne entre resgates e buscas
        </p>
      </div>

      {/* Navigation Groups */}
      <div className="flex flex-col gap-6 overflow-y-auto overflow-x-hidden pr-2">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-3">
              {group.label}
            </h3>
            <nav className="flex flex-col gap-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      active
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">
                      {active ? <span className="font-semibold">{item.label}</span> : item.label}
                    </span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Security Card */}
      <div className="mt-auto p-4 bg-primary/5 rounded-xl border border-primary/10">
        <div className="flex items-center gap-2 mb-2 text-primary">
          <span className="material-symbols-outlined text-sm">security</span>
          <span className="text-xs font-bold uppercase tracking-wider">
            Proteção Ativa
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Suas recompensas são garantidas pelo nosso sistema de custódia seguro.
        </p>
      </div>
    </aside>
  );
}

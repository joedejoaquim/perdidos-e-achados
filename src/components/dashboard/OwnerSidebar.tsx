'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function OwnerSidebar() {
  const pathname = usePathname();
  const [messageCount] = useState(3);

  const menuItems = [
    {
      icon: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard/owner',
      badge: null,
    },
    {
      icon: 'search',
      label: 'Busca Inteligente',
      href: '/dashboard/owner/search',
      badge: null,
    },
    {
      icon: 'chat_bubble',
      label: 'Mensagens',
      href: '/dashboard/owner/messages',
      badge: messageCount,
    },
    {
      icon: 'verified_user',
      label: 'Verificação KYC',
      href: '/dashboard/owner/kyc',
      badge: null,
    },
    {
      icon: 'settings',
      label: 'Configurações',
      href: '/dashboard/owner/settings',
      badge: null,
    },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <aside className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark p-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 px-2">
        <h1 className="text-slate-900 dark:text-slate-100 text-lg font-bold">
          Área do Proprietário
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Gerencie achados e recompensas
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
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
              <span className="material-symbols-outlined text-[22px]">
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

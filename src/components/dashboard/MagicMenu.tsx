'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MagicMenuProps {
  searchQuery?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MagicMenu({ searchQuery = '', onSearchChange }: MagicMenuProps) {
  const pathname = usePathname();

  const menuItems = [
    { icon: 'dashboard', label: 'Proprietário', href: '/dashboard/owner' },
    { icon: 'location_on', label: 'Localizador', href: '/dashboard/finder' },
    { icon: 'chat_bubble', label: 'Mensagens', href: '/dashboard/messages' },
    { icon: 'verified_user', label: 'KYC', href: '/dashboard/kyc' },
    { icon: 'settings', label: 'Ajustes', href: '/dashboard/settings' },
  ];

  return (
    <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-1 rounded-full">
      {menuItems.map((item) => {
        const active = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard/owner' && item.href !== '/dashboard/finder');
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
              active
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={item.label}
          >
            <span className="material-symbols-outlined text-[18px]">
              {item.icon}
            </span>
            <span className={`text-xs font-bold transition-all duration-300 ${active ? 'w-auto opacity-100' : 'hidden'}`}>
              {active && item.label}
            </span>
          </Link>
        );
      })}

      <div className="relative ml-2 w-[220px] transition-all focus-within:w-[280px]">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
        <input
          type="text"
          placeholder="Buscar documentos..."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full bg-slate-200/50 dark:bg-slate-900 border-none rounded-full py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary outline-none transition-all"
        />
      </div>
    </nav>
  );
}

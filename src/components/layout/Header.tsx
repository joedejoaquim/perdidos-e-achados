import React, { useState, memo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MagicMenu from "@/components/dashboard/MagicMenu";

import { useLogout } from "@/hooks/useAuth";
import { User } from "@/types";

interface HeaderProps {
  user: User | null;
  onSearchChange?: (query: string) => void;
  hasNotification?: boolean;
}

export const Header: React.FC<HeaderProps> = memo(({
  user,
  onSearchChange,
  hasNotification = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const isOwnerScreen = pathname === '/dashboard/owner';
  const logout = useLogout();

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
  }, [onSearchChange]);

  const handleLogout = useCallback(async () => {
    setShowUserMenu(false);
    await logout();
  }, [logout]);

  const initials = React.useMemo(() => (
    user?.name
      ? user.name
          .split(" ")
          .map((name) => name.charAt(0))
          .join("")
          .toUpperCase()
      : "?"
  ), [user?.name]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80 md:px-10">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between">
        <Link href="/dashboard/owner" className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-primary p-2 text-white">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            Achados
          </h2>
        </Link>
        
        {!isOwnerScreen && (
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <MagicMenu searchQuery={searchQuery} onSearchChange={handleSearchChange} />
          </div>
        )}

        <div className="flex flex-1" />

        <div className="flex items-center gap-3">
          <button className="group relative rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
            <svg
              className="h-5 w-5 text-slate-600 dark:text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            {hasNotification && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-background-dark" />
            )}
          </button>

          <div className="mx-1 h-8 w-px bg-slate-200 dark:border-slate-800" />

          <div
            className="relative flex cursor-pointer items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </div>
            <span className="hidden text-sm font-medium text-slate-900 dark:text-white sm:inline">
              {user?.name || "Usuario"}
            </span>

            {showUserMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <Link
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  href="/profile"
                >
                  Perfil
                </Link>
                <Link
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  href="/dashboard/settings"
                >
                  Configuracoes
                </Link>
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:text-red-400 dark:hover:bg-slate-800"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";

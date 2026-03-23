"use client";

import React, { memo, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { User } from "@/types";
import { m } from "framer-motion";

interface NavbarProps {
  initialUser?: User | null;
}

export const Navbar = memo(({ initialUser = null }: NavbarProps) => {
  const { user: hydratedUser } = useAuth({ enabled: !initialUser });
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = initialUser ?? hydratedUser;

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <m.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="font-bold text-lg group-hover:text-primary transition-colors duration-200">🎯 ACHADOS</div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition">Dashboard</Link>
              <Link href="/search" className="text-sm font-medium hover:text-primary transition">Buscar</Link>
              <Link href="/profile" className="text-sm font-medium hover:text-primary transition">Perfil</Link>
              <div className="flex items-center gap-3 border-l border-border/40 pl-6 ml-2">
                {user.avatar_url && (
<<<<<<< HEAD
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image
                      src={user.avatar_url}
                      alt={user.name || "User"}
                      fill
                      className="rounded-full object-cover border border-slate-200"
                      sizes="32px"
                    />
                  </div>
=======
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
>>>>>>> origin/main
                )}
                <span className="text-sm font-semibold">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted-foreground hover:text-red-500 font-medium transition-colors"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition">Entrar</Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all"
              >
                Registrar
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          onClick={toggleMobileMenu}
        >
          <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 p-4 bg-card/80 backdrop-blur-md">
          <div className="flex flex-col gap-4">
            <Link href="/dashboard" className="text-sm font-medium" onClick={toggleMobileMenu}>Dashboard</Link>
            <Link href="/search" className="text-sm font-medium" onClick={toggleMobileMenu}>Buscar</Link>
            <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="text-left text-sm text-red-500 font-medium">Sair</button>
          </div>
        </div>
      )}
    </m.nav>
  );
});

Navbar.displayName = "Navbar";


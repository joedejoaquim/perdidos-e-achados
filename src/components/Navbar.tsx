"use client";

import React from "react";
import Link from "next/link";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export const Navbar = () => {
  const { user } = useAuth();
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="font-bold text-lg">🎯 ACHADOS</div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm hover:text-primary transition">
                Dashboard
              </Link>
              <Link href="/search" className="text-sm hover:text-primary transition">
                Buscar
              </Link>
              <Link href="/profile" className="text-sm hover:text-primary transition">
                Perfil
              </Link>
              <div className="flex items-center gap-3 border-l border-border/40 pl-6">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm">{user.name}</span>
                <button
                  onClick={() => logout()}
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm hover:text-primary transition">
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition"
              >
                Registrar
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span>☰</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 p-4 bg-card">
          {user ? (
            <div className="space-y-4">
              <Link href="/dashboard" className="block text-sm">
                Dashboard
              </Link>
              <Link href="/search" className="block text-sm">
                Buscar
              </Link>
              <Link href="/profile" className="block text-sm">
                Perfil
              </Link>
              <button
                onClick={() => logout()}
                className="block text-sm text-muted-foreground w-full text-left"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Link href="/auth/login" className="block text-sm">
                Entrar
              </Link>
              <Link href="/auth/register" className="block text-sm">
                Registrar
              </Link>
            </div>
          )}
        </div>
      )}
    </motion.nav>
  );
};

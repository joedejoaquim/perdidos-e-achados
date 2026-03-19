"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { User } from "@/types";

export function AppShell({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const pathname = usePathname();
  const usesDedicatedChrome =
    pathname?.startsWith("/dashboard") || pathname === "/profile";

  if (usesDedicatedChrome) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar initialUser={initialUser} />
      <main className="container flex-1 py-8">{children}</main>
      <Footer />
    </div>
  );
}

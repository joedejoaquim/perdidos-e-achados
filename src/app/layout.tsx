import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

import { AuthStateListener } from "@/components/auth/AuthStateListener";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ACHADOS - Plataforma de Localização de Documentos Perdidos",
  description: "Conecte-se com pessoas que encontraram seus documentos e objetos perdidos",
  keywords: ["documentos perdidos", "marketplace", "devolução", "achados"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <AuthStateListener />
        {children}
      </body>
    </html>
  );
}

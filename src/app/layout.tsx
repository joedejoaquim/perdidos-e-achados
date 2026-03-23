import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

import { AuthStateListener } from "@/components/auth/AuthStateListener";
import { AnimationProvider } from "@/components/auth/AnimationProvider";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030712',
};

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
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable}`}>
      <head>
        {/* Preconnect to improve external asset loading performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Simplified Font Loading for Material Symbols to avoid Server/Client conflict */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-primary/20`}>
        <AnimationProvider>
          <AuthStateListener />
          {children}
        </AnimationProvider>
      </body>
    </html>
  );
}

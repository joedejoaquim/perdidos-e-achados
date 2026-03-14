import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

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
      <head />
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}

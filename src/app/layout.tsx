import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "PS2 Games Archive | Registro & Backlog de PlayStation 2",
  description: "Catálogo pessoal e registro de jogos de PS2 jogados e planejados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-900/80 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PS2 Archive. Feito para os amantes da era de ouro do PlayStation 2.</p>
        </footer>
      </body>
    </html>
  );
}

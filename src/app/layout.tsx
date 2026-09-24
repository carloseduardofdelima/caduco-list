import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "PS2 Games Archive | Registro & Backlog de PlayStation 2",
    template: "%s | PS2 Archive",
  },
  description:
    "Catálogo pessoal e registro de jogos de PlayStation 2 jogados e planejados. Explore a era de ouro: biblioteca clássica, exclusivos japoneses e backlog.",
  applicationName: "PS2 Games Archive",
  authors: [{ name: "PS2 Archive Team" }],
  keywords: ["PS2", "PlayStation 2", "Games", "Jogos", "Backlog", "Sony", "Retro Gaming", "Japan Exclusives"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "PS2 Games Archive | Catálogo & Registro de PlayStation 2",
    description:
      "Catálogo pessoal e registro de jogos de PS2 jogados e planejados. Explore a era de ouro do PlayStation 2.",
    url: "/",
    siteName: "PS2 Games Archive",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "PS2 Games Archive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PS2 Games Archive | Catálogo & Registro de PlayStation 2",
    description:
      "Catálogo pessoal e registro de jogos de PS2 jogados e planejados.",
    images: ["/opengraph-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PS2 Archive",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-900/80 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-300">
                PS2<span className="text-cyan-400 font-mono">.ARCHIVE</span>
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-slate-400">Era de Ouro do PlayStation 2</span>
            </div>
            <p className="text-slate-500">
              © {new Date().getFullYear()} PS2 Archive. Feito para os amantes de videogames clássicos.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

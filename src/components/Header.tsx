import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import PS2Logo from "@/components/PS2Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 ps2-glass border-b border-cyan-950/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo & Marca */}
        <Link href="/" className="min-w-0">
          <PS2Logo size="sm" />
        </Link>

        {/* Links e Botão Admin */}
        <nav className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors px-1.5 sm:px-2 py-1"
          >
            Jogos
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-md bg-blue-950/60 border border-blue-700/40 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

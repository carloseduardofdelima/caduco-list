import Link from "next/link";
import { Gamepad2, ShieldCheck } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 ps2-glass border-b border-cyan-950/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo & Marca */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-900/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex-shrink-0">
            <Gamepad2 className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white whitespace-nowrap">
                PS2<span className="text-cyan-400 font-mono">.ARCHIVE</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-800/60 whitespace-nowrap">
                PlayStation 2
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-400 truncate">Coleção & Registro de Jogos</p>
          </div>
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

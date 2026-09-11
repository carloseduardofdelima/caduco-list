import Link from "next/link";
import { Gamepad2, ShieldCheck } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 ps2-glass border-b border-cyan-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-blue-900/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">
                PS2<span className="text-cyan-400 font-mono">.ARCHIVE</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-800/60">
                PlayStation 2
              </span>
            </div>
            <p className="text-xs text-slate-400">Coleção & Registro de Jogos</p>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Jogos
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-950/60 border border-blue-700/40 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

import { prisma } from "@/lib/prisma";
import GameCard from "@/components/GameCard";
import { Gamepad2, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { Status } from "@prisma/client";

interface HomePageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const activeStatus = params.status as Status | undefined;
  const searchQuery = params.search || "";
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 36; // 36 jogos por página no grid

  let games: any[] = [];
  let totalCount = 0;
  let playedCount = 0;
  let playingCount = 0;
  let backlogCount = 0;

  try {
    const whereClause = {
      AND: [
        activeStatus ? { status: activeStatus } : {},
        searchQuery
          ? {
              title: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            }
          : {},
      ],
    };

    [games, totalCount, playedCount, playingCount, backlogCount] = await Promise.all([
      prisma.game.findMany({
        where: whereClause,
        orderBy: [{ status: "asc" }, { rating: "desc" }, { title: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.game.count({ where: whereClause }),
      prisma.game.count({ where: { status: "PLAYED" } }),
      prisma.game.count({ where: { status: "PLAYING" } }),
      prisma.game.count({ where: { status: "BACKLOG" } }),
    ]);
  } catch (error) {
    console.warn("Banco de dados ainda não migrado ou indisponível:", error);
  }

  const counts = {
    all: playedCount + playingCount + backlogCount,
    PLAYED: playedCount,
    PLAYING: playingCount,
    BACKLOG: backlogCount,
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl p-6 sm:p-10 ps2-glass border border-cyan-500/20">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Biblioteca Retrô Definitiva</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Reviva e organize as lendas do{" "}
            <span className="text-cyan-400 ps2-neon-text">PlayStation 2</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Acompanhe títulos zerados, sessões atuais e a lista de desejos da biblioteca do console mais vendido de todos os tempos.
          </p>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Gamepad2 className="w-80 h-80 text-cyan-400" />
        </div>
      </section>

      {/* Controles: Busca e Filtros */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filtros por Status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              !activeStatus
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            Todos ({counts.all})
          </Link>
          <Link
            href="/?status=PLAYING"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeStatus === "PLAYING"
                ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            Jogando ({counts.PLAYING})
          </Link>
          <Link
            href="/?status=PLAYED"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeStatus === "PLAYED"
                ? "bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            Jogados ({counts.PLAYED})
          </Link>
          <Link
            href="/?status=BACKLOG"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeStatus === "BACKLOG"
                ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            Backlog ({counts.BACKLOG})
          </Link>
        </div>

        {/* Busca por Título */}
        <form className="relative w-full md:w-72" method="GET">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Buscar por jogo..."
            className="w-full bg-slate-900/90 border border-slate-700/60 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </form>
      </section>

      {/* Grid de Jogos */}
      <section className="space-y-6">
        {games.length === 0 ? (
          <div className="rounded-xl ps2-glass border border-dashed border-slate-800 p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <p className="text-base font-medium text-slate-200">
              Nenhum jogo encontrado {searchQuery ? `para "${searchQuery}"` : ""}.
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Adicione jogos através do painel de administração ou ajuste os filtros.
            </p>
            <Link
              href="/admin"
              className="mt-2 text-xs font-semibold px-4 py-2 rounded-lg ps2-glow-button text-white"
            >
              Adicionar Jogos no Admin
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            {/* Navegação de Páginas */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                {page > 1 && (
                  <Link
                    href={`/?page=${page - 1}${activeStatus ? `&status=${activeStatus}` : ""}${
                      searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
                    }`}
                    className="px-3 py-1.5 rounded-lg ps2-glass border border-slate-800 text-xs font-semibold hover:border-cyan-400 transition-all"
                  >
                    ← Anterior
                  </Link>
                )}
                <span className="text-xs text-slate-400 px-3">
                  Página <strong className="text-cyan-400">{page}</strong> de {totalPages} ({totalCount} jogos)
                </span>
                {page < totalPages && (
                  <Link
                    href={`/?page=${page + 1}${activeStatus ? `&status=${activeStatus}` : ""}${
                      searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
                    }`}
                    className="px-3 py-1.5 rounded-lg ps2-glass border border-slate-800 text-xs font-semibold hover:border-cyan-400 transition-all"
                  >
                    Próxima →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}


import { prisma } from "@/lib/prisma";
import GameCard from "@/components/GameCard";
import { Gamepad2, Search, Tag, Globe, X } from "lucide-react";
import Link from "next/link";
import { Status } from "@prisma/client";

interface HomePageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    tag?: string;
    region?: string;
    page?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const activeStatus = params.status as Status | undefined;
  const searchQuery = params.search || "";
  const activeTag = params.tag || "";
  const activeRegion = params.region || "all"; // "all" | "international" | "japan"
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 36; // 36 jogos por página no grid

  let games: any[] = [];
  let totalCount = 0;
  let playedCount = 0;
  let playingCount = 0;
  let backlogCount = 0;
  let japanCount = 0;
  let internationalCount = 0;
  let availableTags: { name: string; count: number }[] = [];

  const isJapanFilter =
    activeRegion === "japan" ? true : activeRegion === "international" ? false : undefined;

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
        isJapanFilter !== undefined ? { isJapanOnly: isJapanFilter } : {},
        activeTag ? { tags: { has: activeTag } } : {},
      ],
    };

    const [
      gamesResult,
      totalCountResult,
      playedCountResult,
      playingCountResult,
      backlogCountResult,
      japanCountResult,
      internationalCountResult,
      allGamesTags,
    ] = await Promise.all([
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
      prisma.game.count({ where: { isJapanOnly: true } }),
      prisma.game.count({ where: { isJapanOnly: false } }),
      prisma.game.findMany({
        select: { tags: true },
      }),
    ]);

    games = gamesResult;
    totalCount = totalCountResult;
    playedCount = playedCountResult;
    playingCount = playingCountResult;
    backlogCount = backlogCountResult;
    japanCount = japanCountResult;
    internationalCount = internationalCountResult;

    // Calcula as tags mais frequentes
    const tagCountMap: Record<string, number> = {};
    for (const g of allGamesTags) {
      if (Array.isArray(g.tags)) {
        for (const t of g.tags) {
          tagCountMap[t] = (tagCountMap[t] || 0) + 1;
        }
      }
    }

    availableTags = Object.entries(tagCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.warn("Banco de dados ainda não migrado ou indisponível:", error);
  }

  const counts = {
    all: playedCount + playingCount + backlogCount,
    PLAYED: playedCount,
    PLAYING: playingCount,
    BACKLOG: backlogCount,
    japan: japanCount,
    international: internationalCount,
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper para montar URLs mantendo outros filtros
  function buildFilterUrl(opts: {
    status?: string | null;
    tag?: string | null;
    region?: string | null;
    search?: string | null;
    page?: number | null;
  }) {
    const q = new URLSearchParams();

    const statusVal = opts.status !== undefined ? opts.status : activeStatus;
    if (statusVal) q.set("status", statusVal);

    const regionVal = opts.region !== undefined ? opts.region : activeRegion;
    if (regionVal && regionVal !== "all") q.set("region", regionVal);

    const tagVal = opts.tag !== undefined ? opts.tag : activeTag;
    if (tagVal) q.set("tag", tagVal);

    const searchVal = opts.search !== undefined ? opts.search : searchQuery;
    if (searchVal) q.set("search", searchVal);

    const pageVal = opts.page !== undefined ? opts.page : 1;
    if (pageVal && pageVal > 1) q.set("page", String(pageVal));

    const queryString = q.toString();
    return queryString ? `/?${queryString}` : "/";
  }

  const hasActiveFilters = Boolean(
    activeStatus || (activeRegion && activeRegion !== "all") || activeTag || searchQuery
  );

  return (
    <div className="space-y-8">
      {/* Seletor de Região (Exclusivos do Japão vs Internacionais) */}
      <section className="p-1.5 rounded-2xl ps2-glass border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 px-3 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Região:</span>
          </span>

          <Link
            href={buildFilterUrl({ region: "all" })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeRegion === "all"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            Todos ({counts.all})
          </Link>

          <Link
            href={buildFilterUrl({ region: "international" })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeRegion === "international"
                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <span>🌐</span>
            <span>Internacionais ({counts.international})</span>
          </Link>

          <Link
            href={buildFilterUrl({ region: "japan" })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeRegion === "japan"
                ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <span>🇯🇵</span>
            <span>Exclusivos do Japão ({counts.japan})</span>
          </Link>
        </div>

        {hasActiveFilters && (
          <Link
            href="/"
            className="text-xs text-rose-300 hover:text-rose-200 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-center gap-1 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar Filtros</span>
          </Link>
        )}
      </section>

      {/* Controles: Status e Busca */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filtros por Status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Link
            href={buildFilterUrl({ status: null })}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              !activeStatus
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            Todos os Status
          </Link>
          <Link
            href={buildFilterUrl({ status: "PLAYING" })}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeStatus === "PLAYING"
                ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            Jogando ({counts.PLAYING})
          </Link>
          <Link
            href={buildFilterUrl({ status: "PLAYED" })}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeStatus === "PLAYED"
                ? "bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            Jogados ({counts.PLAYED})
          </Link>
          <Link
            href={buildFilterUrl({ status: "BACKLOG" })}
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
          {activeRegion && activeRegion !== "all" && (
            <input type="hidden" name="region" value={activeRegion} />
          )}
          {activeTag && <input type="hidden" name="tag" value={activeTag} />}
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

      {/* Barra de Filtro de Tags */}
      {availableTags.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filtrar por Gênero & Tag:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none flex-wrap">
            <Link
              href={buildFilterUrl({ tag: null })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                !activeTag
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Todas as Tags
            </Link>

            {availableTags.map((tag) => {
              const isSelected = activeTag.toLowerCase() === tag.name.toLowerCase();
              return (
                <Link
                  key={tag.name}
                  href={buildFilterUrl({ tag: isSelected ? null : tag.name })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)] border border-cyan-400"
                      : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-cyan-300 border border-slate-800"
                  }`}
                >
                  <span>#{tag.name}</span>
                  <span
                    className={`text-[10px] px-1 rounded ${
                      isSelected ? "bg-black/30 text-black font-bold" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tag.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Grid de Jogos */}
      <section className="space-y-6">
        {games.length === 0 ? (
          <div className="rounded-xl ps2-glass border border-dashed border-slate-800 p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <p className="text-base font-medium text-slate-200">
              Nenhum jogo encontrado com os filtros selecionados.
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Tente selecionar outra tag, remover os filtros ou cadastrar novos jogos no painel de administração.
            </p>
            <div className="flex items-center gap-3 mt-2">
              {hasActiveFilters && (
                <Link
                  href="/"
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  Limpar Todos os Filtros
                </Link>
              )}
              <Link
                href="/admin"
                className="text-xs font-semibold px-4 py-2 rounded-lg ps2-glow-button text-white"
              >
                Adicionar Jogos no Admin
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Exibindo <strong>{games.length}</strong> de <strong>{totalCount}</strong> jogos encontrados
              </span>
              {activeTag && (
                <span className="text-cyan-400 font-semibold">
                  Filtro de Tag: #{activeTag}
                </span>
              )}
            </div>

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
                    href={buildFilterUrl({ page: page - 1 })}
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
                    href={buildFilterUrl({ page: page + 1 })}
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


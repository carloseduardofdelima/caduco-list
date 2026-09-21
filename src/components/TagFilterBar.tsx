"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Tag, ChevronDown, ChevronUp, Layers, Check } from "lucide-react";

interface TagItem {
  name: string;
  count: number;
}

interface TagFilterBarProps {
  availableTags: TagItem[];
  activeTag?: string;
  totalGamesCount?: number;
}

const GAME_MODES = new Set(["Singleplayer", "Multiplayer", "Co-op", "Split-screen", "MMO"]);

export default function TagFilterBar({
  availableTags,
  activeTag = "",
  totalGamesCount,
}: TagFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  function createTagUrl(newTag: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (newTag) {
      params.set("tag", newTag);
    } else {
      params.delete("tag");
    }
    params.delete("page"); // Reseta para a primeira página ao filtrar
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  // Separa em Modos de Jogo e Gêneros para organização refinada
  const modeTags = availableTags.filter((t) => GAME_MODES.has(t.name));
  const genreTags = availableTags.filter((t) => !GAME_MODES.has(t.name));

  // Top tags para exibição rápida no desktop
  const topDesktopTags = availableTags.slice(0, 9);
  const otherDesktopTags = availableTags.slice(9);

  return (
    <section className="space-y-2.5">
      {/* Cabeçalho da seção com controles */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-400">
          <Tag className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filtrar por Modo & Gênero:</span>
          {activeTag && (
            <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-full ml-1 flex items-center gap-1">
              Ativo: #{activeTag}
            </span>
          )}
        </div>

        {/* Botão de alternar visualização no desktop */}
        <button
          type="button"
          onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
          className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded hover:bg-slate-800/60"
        >
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>{isDesktopExpanded ? "Condensar Tags" : `Ver Todas (${availableTags.length})`}</span>
          {isDesktopExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 📱 VERSÃO MOBILE (Condensada em Dropdown + Atalhos Rápidos) */}
      {/* ========================================================= */}
      <div className="md:hidden space-y-2">
        {/* Dropdown Nativo Estilizado (Melhor UX e performance no celular) */}
        <div className="relative">
          <select
            value={activeTag}
            onChange={(e) => router.push(createTagUrl(e.target.value || null))}
            aria-label="Filtrar por Tag ou Gênero"
            className="w-full bg-slate-900/95 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 appearance-none shadow-[0_4px_20px_rgba(0,0,0,0.4)] ps2-glass"
          >
            <option value="" className="bg-slate-900 text-slate-300">
              🏷️ Todas as Tags e Modos {totalGamesCount ? `(${totalGamesCount})` : ""}
            </option>

            {modeTags.length > 0 && (
              <optgroup label="🎮 Modos de Jogo" className="bg-slate-900 text-cyan-400 font-bold">
                {modeTags.map((tag) => (
                  <option
                    key={tag.name}
                    value={tag.name}
                    className="bg-slate-900 text-slate-200 font-medium"
                  >
                    #{tag.name} ({tag.count} jogos)
                  </option>
                ))}
              </optgroup>
            )}

            {genreTags.length > 0 && (
              <optgroup label="🎭 Gêneros" className="bg-slate-900 text-cyan-400 font-bold">
                {genreTags.map((tag) => (
                  <option
                    key={tag.name}
                    value={tag.name}
                    className="bg-slate-900 text-slate-200 font-medium"
                  >
                    #{tag.name} ({tag.count} jogos)
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          {/* Seta do select */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Linha Única de Pílulas com Atalhos Rápidos (Scroll horizontal, sem quebrar linhas) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
          <Link
            href={createTagUrl(null)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              !activeTag
                ? "bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            Todas
          </Link>

          {/* Pílulas de Modos Principais */}
          {modeTags.map((tag) => {
            const isSelected = activeTag.toLowerCase() === tag.name.toLowerCase();
            return (
              <Link
                key={tag.name}
                href={createTagUrl(isSelected ? null : tag.name)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? "bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)] border border-cyan-400"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
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
      </div>

      {/* ========================================================= */}
      {/* 💻 VERSÃO DESKTOP / TABLET */}
      {/* ========================================================= */}
      <div className="hidden md:block">
        {!isDesktopExpanded ? (
          /* MODO COMPACTO (1 Linha com Top Tags + Dropdown para as restantes) */
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
            <Link
              href={createTagUrl(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                !activeTag
                  ? "bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Todas as Tags
            </Link>

            {topDesktopTags.map((tag) => {
              const isSelected = activeTag.toLowerCase() === tag.name.toLowerCase();
              return (
                <Link
                  key={tag.name}
                  href={createTagUrl(isSelected ? null : tag.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
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

            {/* Dropdown "Mais Tags" para o restante */}
            {otherDesktopTags.length > 0 && (
              <div className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    otherDesktopTags.some((t) => t.name.toLowerCase() === activeTag.toLowerCase())
                      ? "bg-cyan-950 border border-cyan-500 text-cyan-300"
                      : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <span>+ Mais Tags ({otherDesktopTags.length})</span>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto rounded-xl bg-slate-900/95 border border-cyan-500/30 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.6)] ps2-glass z-50 space-y-1">
                      {otherDesktopTags.map((tag) => {
                        const isSelected = activeTag.toLowerCase() === tag.name.toLowerCase();
                        return (
                          <Link
                            key={tag.name}
                            href={createTagUrl(isSelected ? null : tag.name)}
                            onClick={() => setIsDropdownOpen(false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                              isSelected
                                ? "bg-cyan-500 text-black font-bold"
                                : "text-slate-300 hover:bg-slate-800 hover:text-cyan-300"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {isSelected && <Check className="w-3 h-3" />}
                              #{tag.name}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isSelected ? "bg-black/30 text-black" : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {tag.count}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          /* MODO EXPANDIDO (Grid completo organizado por seções) */
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3 ps2-glass">
            {/* Seção: Modos de Jogo */}
            {modeTags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-400">
                  Modos de Jogo
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {modeTags.map((tag) => {
                    const isSelected = activeTag.toLowerCase() === tag.name.toLowerCase();
                    return (
                      <Link
                        key={tag.name}
                        href={createTagUrl(isSelected ? null : tag.name)}
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
              </div>
            )}

            {/* Seção: Gêneros */}
            {genreTags.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Gêneros
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {genreTags.map((tag) => {
                    const isSelected = activeTag.toLowerCase() === tag.name.toLowerCase();
                    return (
                      <Link
                        key={tag.name}
                        href={createTagUrl(isSelected ? null : tag.name)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
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
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

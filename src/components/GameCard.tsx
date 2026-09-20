import Link from "next/link";
import { Star, Calendar, Disc } from "lucide-react";
import { Status } from "@prisma/client";

interface GameCardProps {
  game: {
    id: string;
    title: string;
    coverUrl?: string | null;
    status: Status;
    rating?: number | null;
    playedAt?: Date | string | null;
    tags?: string[];
    isJapanOnly?: boolean;
  };
}

const statusConfig: Record<
  Status,
  { label: string; badgeClass: string }
> = {
  PLAYED: {
    label: "Jogado",
    badgeClass: "bg-emerald-950/80 text-emerald-400 border-emerald-600/40",
  },
  PLAYING: {
    label: "Jogando",
    badgeClass: "bg-amber-950/80 text-amber-300 border-amber-500/40",
  },
  BACKLOG: {
    label: "Backlog",
    badgeClass: "bg-blue-950/80 text-cyan-300 border-cyan-700/40",
  },
};

export default function GameCard({ game }: GameCardProps) {
  const statusInfo = statusConfig[game.status];

  return (
    <Link
      href={`/jogo/${game.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden ps2-glass ps2-glass-hover"
    >
      {/* Container da Capa */}
      <div className="relative aspect-[3/4] w-full bg-slate-900/90 overflow-hidden flex items-center justify-center">
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-600 p-4 text-center">
            <Disc className="w-12 h-12 text-slate-700 animate-spin-slow" />
            <span className="text-xs font-semibold">Sem Capa</span>
          </div>
        )}

        {/* Badge Exclusivo Japão */}
        {game.isJapanOnly && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/50 backdrop-blur-md shadow-lg shadow-rose-950/50">
              <span>🇯🇵</span>
              <span>JAPÃO</span>
            </span>
          </div>
        )}

        {/* Badge de Status */}
        <div className="absolute top-2 right-2">
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-md ${statusInfo.badgeClass}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Avaliação em Estrela */}
        {game.rating && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-500/40 text-amber-300 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{game.rating}/10</span>
          </div>
        )}
      </div>

      {/* Detalhes do Jogo */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <h3 className="font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-cyan-300 transition-colors">
            {game.title}
          </h3>

          {/* Tags do Jogo */}
          {game.tags && game.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {game.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900/90 text-cyan-300/80 border border-cyan-900/40 font-medium"
                >
                  {tag}
                </span>
              ))}
              {game.tags.length > 2 && (
                <span className="text-[10px] text-slate-500 px-1 py-0.2">
                  +{game.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
          <span className="text-slate-500 font-mono text-[10px]">PlayStation 2</span>
          {game.playedAt && (
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3 text-cyan-500" />
              <span>
                {new Date(game.playedAt).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

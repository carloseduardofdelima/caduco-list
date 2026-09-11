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
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <h3 className="font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-cyan-300 transition-colors">
          {game.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-slate-500 font-mono">PlayStation 2</span>
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

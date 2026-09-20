import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Disc, Star, MessageSquare } from "lucide-react";
import { Status } from "@prisma/client";

interface GameDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<
  Status,
  { label: string; badgeClass: string; desc: string }
> = {
  PLAYED: {
    label: "Jogado / Zerado",
    badgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50",
    desc: "Jogo já concluído e avaliado.",
  },
  PLAYING: {
    label: "Jogando Atualmente",
    badgeClass: "bg-amber-950/80 text-amber-300 border-amber-500/50",
    desc: "Em andamento nas sessões atuais.",
  },
  BACKLOG: {
    label: "Na Fila (Backlog)",
    badgeClass: "bg-blue-950/80 text-cyan-300 border-cyan-500/50",
    desc: "Planejado para jogar em breve.",
  },
};

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params;

  let game = null;
  try {
    game = await prisma.game.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Erro ao buscar jogo:", error);
  }

  if (!game) {
    notFound();
  }

  const statusInfo = statusConfig[game.status];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Botão de Retorno */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao catálogo</span>
      </Link>

      <div className="ps2-glass rounded-2xl p-6 sm:p-8 border border-cyan-500/20 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Capa do Jogo */}
        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 shadow-2xl flex items-center justify-center">
          {game.coverUrl ? (
            <img
              src={game.coverUrl}
              alt={game.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-600 gap-2">
              <Disc className="w-16 h-16" />
              <span className="text-xs">Sem Imagem</span>
            </div>
          )}

        </div>

        {/* Informações e Notas */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${statusInfo.badgeClass}`}
              >
                {statusInfo.label}
              </span>

              {game.isJapanOnly ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-950/40">
                  <span>🇯🇵</span>
                  <span>Exclusivo do Japão (NTSC-J)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  <span>🌐</span>
                  <span>Lançamento Internacional</span>
                </span>
              )}

              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                Plataforma: {game.platform}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {game.title}
            </h1>

            {/* Tags e Gêneros */}
            {game.tags && game.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-xs text-slate-400 font-medium mr-1">Tags:</span>
                {game.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/?tag=${encodeURIComponent(tag)}`}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Avaliação e Data */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Nota Pessoal</span>
              {game.rating ? (
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-bold text-amber-400">
                    {game.rating}
                    <span className="text-sm font-normal text-slate-400">/10</span>
                  </span>
                </div>
              ) : (
                <span className="text-sm text-slate-500 italic">Não avaliado</span>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1">Data da Conclusão</span>
              {game.playedAt ? (
                <div className="flex items-center gap-2 text-slate-200">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-semibold">
                    {new Date(game.playedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-slate-500 italic">Não registrada</span>
              )}
            </div>
          </div>

          {/* Notas Pessoais / Anotações */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Anotações & Memórias</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-sm whitespace-pre-line leading-relaxed">
              {game.notes ? (
                game.notes
              ) : (
                <span className="text-slate-500 italic">
                  Nenhuma anotação registrada para este jogo.
                </span>
              )}
            </div>
          </div>

          {/* Ações de Edição (Admin) */}
          <div className="pt-2 flex items-center gap-4">
            <Link
              href={`/admin?edit=${game.id}`}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-950/60 border border-blue-700/50 text-cyan-300 hover:border-cyan-400 transition-all"
            >
              Editar Informações no Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

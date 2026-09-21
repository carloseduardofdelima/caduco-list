import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Disc,
  Star,
  MessageSquare,
  Building2,
  Building,
  Info,
  Edit3,
} from "lucide-react";
import { Status } from "@prisma/client";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import { getGameExtraInfo } from "@/lib/igdb";
import { getGameGifs } from "@/lib/gif";

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

  let game: any = null;
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

  // Busca dados adicionais e GIFs de gameplay dinamicamente em paralelo
  let extraInfo: any = {};
  const hasScreenshots = Array.isArray(game.screenshots) && game.screenshots.length > 0;

  const [extraInfoResult, gifs] = await Promise.all([
    !hasScreenshots || !game.summary || !game.developer
      ? getGameExtraInfo(game.title, game.igdbId).catch((e) => {
          console.warn("Aviso ao buscar detalhes adicionais do jogo:", e);
          return {};
        })
      : Promise.resolve({}),
    getGameGifs(game.title).catch((e) => {
      console.warn("Aviso ao buscar GIFs do jogo:", e);
      return [];
    }),
  ]);

  extraInfo = extraInfoResult || {};

  const screenshots = hasScreenshots
    ? game.screenshots
    : extraInfo.screenshots && extraInfo.screenshots.length > 0
    ? extraInfo.screenshots
    : [];

  const summary = game.summary || extraInfo.summary || null;
  const developer = game.developer || extraInfo.developer || null;
  const publisher = game.publisher || extraInfo.publisher || null;
  const releaseYear = game.releaseYear || extraInfo.releaseYear || null;

  const statusInfo = statusConfig[game.status as Status];
  const backdropImage =
    screenshots.length > 0 ? screenshots[0] : gifs.length > 0 ? gifs[0] : null;

  return (
    <div className="relative space-y-8 max-w-5xl mx-auto">
      {/* Imagem de Fundo / Backdrop Atmosférico */}
      {backdropImage && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-screen max-w-6xl h-80 -z-10 overflow-hidden pointer-events-none opacity-25 mask-radial">
          <img
            src={backdropImage}
            alt="Backdrop"
            className="w-full h-full object-cover blur-md scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07090e]/80 to-[#07090e]" />
        </div>
      )}

      {/* Botão de Retorno */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao catálogo</span>
        </Link>

        <Link
          href={`/admin?edit=${game.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-700/50 text-cyan-300 hover:border-cyan-400 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editar no Admin</span>
        </Link>
      </div>

      {/* Cartão Principal do Jogo */}
      <div className="ps2-glass rounded-2xl p-6 sm:p-8 border border-cyan-500/20 grid grid-cols-1 md:grid-cols-3 gap-8 items-start shadow-2xl">
        {/* Capa do Jogo */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 shadow-2xl flex items-center justify-center group">
            {game.coverUrl ? (
              <img
                src={game.coverUrl}
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600 gap-2">
                <Disc className="w-16 h-16" />
                <span className="text-xs">Sem Imagem</span>
              </div>
            )}

            {/* Badge de Região na Capa */}
            {game.isJapanOnly && (
              <div className="absolute top-2.5 left-2.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/50 backdrop-blur-md shadow-lg shadow-rose-950/60">
                  <span>🇯🇵</span>
                  <span>JAPÃO ONLY</span>
                </span>
              </div>
            )}
          </div>

          {/* Metadados Técnicos Compactos */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800/60">
              <span className="text-slate-500 font-mono">Plataforma:</span>
              <span className="font-bold text-slate-200">PlayStation 2</span>
            </div>

            {releaseYear && (
              <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Ano:</span>
                <span className="font-semibold text-slate-200">{releaseYear}</span>
              </div>
            )}

            {developer && (
              <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800/60">
                <span className="text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-cyan-400" />
                  <span>Dev:</span>
                </span>
                <span className="font-semibold text-slate-200 text-right truncate max-w-[140px]">
                  {developer}
                </span>
              </div>
            )}

            {publisher && (
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-slate-500 flex items-center gap-1">
                  <Building className="w-3 h-3 text-cyan-400" />
                  <span>Pub:</span>
                </span>
                <span className="font-semibold text-slate-200 text-right truncate max-w-[140px]">
                  {publisher}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Informações, Sinopse e Avaliações */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-3">
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
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {game.title}
            </h1>

            {/* Tags e Gêneros */}
            {game.tags && game.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
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

          {/* Sinopse / Sobre o Jogo */}
          {summary && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-950/50 border border-cyan-900/30">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sobre o Jogo & Sinopse</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {summary}
              </p>
            </div>
          )}

          {/* Galeria de Screenshots e GIFs de Gameplay */}
          {(screenshots.length > 0 || gifs.length > 0) && (
            <ScreenshotGallery
              screenshots={screenshots}
              gifs={gifs}
              gameTitle={game.title}
            />
          )}

          {/* Avaliação e Data da Gameplay */}
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
              <span>Minhas Anotações & Memórias</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-sm whitespace-pre-line leading-relaxed">
              {game.notes ? (
                game.notes
              ) : (
                <span className="text-slate-500 italic">
                  Nenhuma anotação pessoal registrada para este jogo.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


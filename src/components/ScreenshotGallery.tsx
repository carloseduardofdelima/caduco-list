"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface ScreenshotGalleryProps {
  screenshots: string[];
  gameTitle: string;
}

export default function ScreenshotGallery({ screenshots, gameTitle }: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, screenshots.length]);

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  function handlePrev() {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + screenshots.length) % screenshots.length);
  }

  function handleNext() {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % screenshots.length);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          <span>Screenshots de Gameplay</span>
          <span className="text-[11px] font-normal text-slate-400">
            ({screenshots.length} imagens)
          </span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Clique para ampliar
        </span>
      </div>

      {/* Grid de Imagens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {screenshots.map((url, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-slate-950 border border-slate-800 hover:border-cyan-400 transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          >
            <img
              src={url}
              alt={`${gameTitle} screenshot ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
              <span className="text-[10px] font-mono text-cyan-300">
                #{idx + 1}
              </span>
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal Lightbox */}
      {selectedIndex !== null && (
        <div
          onClick={() => setSelectedIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
        >
          {/* Header do Lightbox */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl flex items-center justify-between text-slate-300 pb-2 border-b border-slate-800"
          >
            <div>
              <h4 className="text-sm font-bold text-white">{gameTitle}</h4>
              <span className="text-xs text-cyan-400 font-mono">
                Imagem {selectedIndex + 1} de {screenshots.length}
              </span>
            </div>

            <button
              onClick={() => setSelectedIndex(null)}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Imagem Central com Controles */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden"
          >
            {screenshots.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-10 p-2.5 rounded-full bg-black/70 hover:bg-cyan-500 hover:text-black text-white border border-slate-700 hover:border-cyan-400 backdrop-blur-md transition-all"
                title="Anterior (←)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={screenshots[selectedIndex]}
              alt={`${gameTitle} screenshot full`}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-cyan-500/30"
            />

            {screenshots.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-10 p-2.5 rounded-full bg-black/70 hover:bg-cyan-500 hover:text-black text-white border border-slate-700 hover:border-cyan-400 backdrop-blur-md transition-all"
                title="Próxima (→)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Miniaturas no Rodapé */}
          {screenshots.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 overflow-x-auto max-w-2xl p-2 bg-slate-950/80 rounded-xl border border-slate-800 scrollbar-none"
            >
              {screenshots.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-16 h-10 flex-shrink-0 rounded-lg overflow-hidden border transition-all ${
                    idx === selectedIndex
                      ? "border-cyan-400 scale-105 shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                      : "border-slate-800 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

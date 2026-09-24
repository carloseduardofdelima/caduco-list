import React from "react";

interface PS2LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

const sizeConfig = {
  xs: { icon: "w-7 h-7", text: "text-sm", sub: "text-[10px]" },
  sm: { icon: "w-9 h-9 sm:w-10 sm:h-10", text: "text-base sm:text-lg", sub: "text-xs" },
  md: { icon: "w-12 h-12", text: "text-xl", sub: "text-xs" },
  lg: { icon: "w-16 h-16", text: "text-2xl", sub: "text-sm" },
  xl: { icon: "w-24 h-24", text: "text-4xl", sub: "text-base" },
};

export default function PS2Logo({
  size = "sm",
  showText = true,
  showSubtitle = true,
  className = "",
}: PS2LogoProps) {
  const currentSize = sizeConfig[size] || sizeConfig.sm;

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {/* Ícone Emblemático PS2 */}
      <div
        className={`${currentSize.icon} relative flex-shrink-0 rounded-xl overflow-hidden p-0.5 transition-all duration-300 group-hover:scale-105`}
        title="PS2 Archive"
      >
        {/* Glow de fundo */}
        <div className="absolute inset-0 bg-cyan-500/20 rounded-xl blur-sm group-hover:bg-cyan-400/40 transition-all duration-300" />

        {/* Borda e Container com Glassmorphism */}
        <div className="relative w-full h-full rounded-[10px] bg-[#070b16] border border-cyan-500/40 group-hover:border-cyan-400 group-hover:shadow-[0_0_18px_rgba(0,240,255,0.45)] flex items-center justify-center p-1 transition-all">
          <svg
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="logoPs2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38e1ff" />
                <stop offset="35%" stopColor="#0099ff" />
                <stop offset="100%" stopColor="#002277" />
              </linearGradient>
            </defs>

            {/* Linhas sutis de fundo */}
            <g opacity="0.15" stroke="#00f0ff" strokeWidth="2">
              <line x1="160" y1="40" x2="160" y2="472" />
              <line x1="256" y1="40" x2="256" y2="472" />
              <line x1="352" y1="40" x2="352" y2="472" />
            </g>

            {/* Letras estilizadas PS2 */}
            <g transform="translate(10, 10)">
              {/* P */}
              <path
                d="M 96 160 H 176 C 212 160 234 182 234 216 C 234 250 212 272 176 272 H 146 V 344 H 96 V 160 Z M 146 202 V 230 H 174 C 188 230 196 224 196 216 C 196 208 188 202 174 202 H 146 Z"
                fill="url(#logoPs2Grad)"
              />
              {/* S */}
              <path
                d="M 326 182 C 314 168 294 160 270 160 C 234 160 212 180 212 210 C 212 258 316 238 316 288 C 316 306 300 318 274 318 C 246 318 226 304 212 286 L 180 316 C 202 342 234 358 274 358 C 326 358 360 330 360 286 C 360 232 256 254 256 208 C 256 196 266 188 280 188 C 298 188 312 196 322 208 L 326 182 Z"
                fill="url(#logoPs2Grad)"
              />
              {/* 2 */}
              <path
                d="M 362 196 C 362 174 380 160 408 160 C 438 160 456 178 456 204 C 456 236 422 264 388 296 H 458 V 344 H 360 V 302 L 410 248 C 420 236 426 224 426 212 C 426 202 418 196 408 196 C 396 196 388 204 386 214 L 362 196 Z"
                fill="url(#logoPs2Grad)"
              />
            </g>

            {/* Os 4 símbolos clássicos da PlayStation na base */}
            <g transform="translate(256, 420)">
              {/* Triângulo (Verde) */}
              <polygon
                points="-90,-10 -78,10 -102,10"
                stroke="#00f5a0"
                strokeWidth="4"
                fill="none"
              />
              {/* Círculo (Vermelho) */}
              <circle cx="-30" cy="1" r="10" stroke="#ff4359" strokeWidth="4" fill="none" />
              {/* Cruz (Azul Cyan) */}
              <g transform="translate(30, 1)">
                <line x1="-8" y1="-8" x2="8" y2="8" stroke="#00f0ff" strokeWidth="4" strokeLinecap="round" />
                <line x1="8" y1="-8" x2="-8" y2="8" stroke="#00f0ff" strokeWidth="4" strokeLinecap="round" />
              </g>
              {/* Quadrado (Rosa) */}
              <rect x="79" y="-9" width="20" height="20" rx="2" stroke="#ff5ea5" strokeWidth="4" fill="none" />
            </g>
          </svg>
        </div>
      </div>

      {/* Tipografia da Marca */}
      {showText && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`font-extrabold ${currentSize.text} tracking-wider text-white whitespace-nowrap`}>
              PS2<span className="text-cyan-400 font-mono">.ARCHIVE</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-800/60 whitespace-nowrap">
              PlayStation 2
            </span>
          </div>
          {showSubtitle && (
            <p className={`hidden sm:block ${currentSize.sub} text-slate-400 truncate`}>
              Coleção &amp; Registro de Jogos
            </p>
          )}
        </div>
      )}
    </div>
  );
}

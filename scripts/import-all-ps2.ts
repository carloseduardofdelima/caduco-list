import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("ERRO: Configure TWITCH_CLIENT_ID e TWITCH_CLIENT_SECRET no .env");
  process.exit(1);
}

async function getTwitchToken(): Promise<string> {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: "client_credentials",
    }),
  });
  const data = await res.json();
  return data.access_token;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GENRE_TRANSLATIONS: Record<string, string> = {
  "Racing": "Corrida",
  "Arcade": "Arcade",
  "Shooter": "Tiro",
  "Fighting": "Luta",
  "Role-playing (RPG)": "RPG",
  "Adventure": "Aventura",
  "Action": "Ação",
  "Hack and slash/Beat 'em up": "Hack and Slash",
  "Platform": "Plataforma",
  "Simulator": "Simulador",
  "Sport": "Esporte",
  "Strategy": "Estratégia",
  "Turn-based strategy (TBS)": "Estratégia",
  "Real Time Strategy (RTS)": "Estratégia",
  "Tactical": "Tático",
  "Puzzle": "Puzzle",
  "Horror": "Terror",
  "Survival": "Sobrevivência",
  "Music": "Música",
  "Visual Novel": "Visual Novel",
  "Stealth": "Furtividade",
  "Open world": "Mundo Aberto",
  "Sci-fi": "Ficção Científica",
  "Fantasy": "Fantasia",
  "Anime": "Anime",
  "Mecha": "Mecha",
};

async function importAllPS2Games() {
  console.log("🎮 Iniciando importação em massa de jogos de PS2 da IGDB...");
  const token = await getTwitchToken();

  // Limite máximo por requisição na IGDB é 500
  const limit = 500;
  let offset = 0;
  let totalImported = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`📡 Buscando lote de ${limit} jogos (offset: ${offset})...`);

    // 8 = PlayStation 2 na IGDB
    const query = `
      fields id, name, cover.image_id, total_rating, first_release_date, summary, storyline, genres.name, themes.name, game_modes.name, release_dates.region, release_dates.y, screenshots.image_id, involved_companies.developer, involved_companies.publisher, involved_companies.company.name;
      where platforms = (8);
      sort id asc;
      limit ${limit};
      offset ${offset};
    `;

    try {
      const res = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
          "Client-ID": clientId!,
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body: query,
      });

      if (!res.ok) {
        console.error("Erro na API da IGDB:", await res.text());
        break;
      }

      const games = await res.json();

      if (!games || games.length === 0) {
        console.log("Nenhum jogo adicional encontrado. Fim dos lotes.");
        break;
      }

      for (const game of games) {
        let coverUrl: string | null = null;
        if (game.cover?.image_id) {
          coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`;
        }

        const rating = game.total_rating ? Math.round(game.total_rating / 10) : null;
        const playedAt = game.first_release_date
          ? new Date(game.first_release_date * 1000)
          : null;
        const releaseYear = game.first_release_date
          ? new Date(game.first_release_date * 1000).getFullYear()
          : (game.release_dates?.[0]?.y || null);

        // Screenshots
        const screenshots: string[] = [];
        if (Array.isArray(game.screenshots)) {
          for (const s of game.screenshots) {
            if (s?.image_id) {
              screenshots.push(`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${s.image_id}.jpg`);
            }
          }
        }

        // Developer e Publisher
        let developer: string | null = null;
        let publisher: string | null = null;
        if (Array.isArray(game.involved_companies)) {
          for (const item of game.involved_companies) {
            if (item.developer && item.company?.name && !developer) {
              developer = item.company.name;
            }
            if (item.publisher && item.company?.name && !publisher) {
              publisher = item.company.name;
            }
          }
        }

        // Extrai tags
        const rawTags: string[] = [];
        if (Array.isArray(game.genres)) {
          for (const g of game.genres) {
            if (g?.name) rawTags.push(GENRE_TRANSLATIONS[g.name] || g.name);
          }
        }
        if (Array.isArray(game.themes)) {
          for (const t of game.themes) {
            if (t?.name && GENRE_TRANSLATIONS[t.name]) rawTags.push(GENRE_TRANSLATIONS[t.name]);
          }
        }
        if (Array.isArray(game.game_modes)) {
          const MODE_MAP: Record<string, string> = {
            "Single player": "Singleplayer",
            "Multiplayer": "Multiplayer",
            "Co-operative": "Co-op",
            "Split screen": "Split-screen",
            "Massively Multiplayer Online (MMO)": "MMO",
          };
          for (const m of game.game_modes) {
            if (m?.name && MODE_MAP[m.name]) rawTags.push(MODE_MAP[m.name]);
          }
        }
        let tags = Array.from(new Set(rawTags));
        const hasMulti = tags.some((t) => ["Multiplayer", "Co-op", "Split-screen", "MMO"].includes(t));
        if (hasMulti) {
          tags = tags.filter((t) => t !== "Singleplayer");
        } else if (!tags.includes("Singleplayer")) {
          tags.push("Singleplayer");
        }

        // Detecção de Exclusivo do Japão
        let isJapanOnly = false;
        if (Array.isArray(game.release_dates) && game.release_dates.length > 0) {
          const regions = game.release_dates.map((r: any) => r.region);
          const hasJapan = regions.includes(5);
          const hasWest = regions.some((r: number) => [1, 2, 3, 4, 8].includes(r));
          if (hasJapan && !hasWest) {
            isJapanOnly = true;
          }
        }
        if (!isJapanOnly && /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(game.name)) {
          isJapanOnly = true;
        }

        // Upsert para não duplicar jogos e preservar jogos que você já tenha alterado o status
        await prisma.game.upsert({
          where: { igdbId: String(game.id) },
          update: {
            title: game.name,
            coverUrl: coverUrl || undefined,
            tags,
            isJapanOnly,
            summary: game.summary || undefined,
            storyline: game.storyline || undefined,
            developer: developer || undefined,
            publisher: publisher || undefined,
            releaseYear: releaseYear || undefined,
            screenshots: screenshots.length > 0 ? screenshots : undefined,
          },
          create: {
            igdbId: String(game.id),
            title: game.name,
            coverUrl,
            status: "BACKLOG",
            rating: null,
            notes: null,
            platform: "PS2",
            tags,
            isJapanOnly,
            summary: game.summary || null,
            storyline: game.storyline || null,
            developer,
            publisher,
            releaseYear,
            screenshots,
          },
        });

        totalImported++;
      }

      console.log(`✅ Lote finalizado! Total sincronizado até agora: ${totalImported}`);

      if (games.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
        // Respeita o rate limit da IGDB (4 requests por segundo)
        await sleep(350);
      }
    } catch (err) {
      console.error("Erro no processamento do lote:", err);
      await sleep(1000);
    }
  }

  console.log(`🎉 Importação completa! Total final de jogos no Neon: ${totalImported}`);
}

importAllPS2Games()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

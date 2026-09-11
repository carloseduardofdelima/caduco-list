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
      fields id, name, cover.image_id, total_rating, first_release_date, summary;
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

        // Upsert para não duplicar jogos e preservar jogos que você já tenha alterado o status
        await prisma.game.upsert({
          where: { igdbId: String(game.id) },
          update: {
            title: game.name,
            coverUrl: coverUrl || undefined,
          },
          create: {
            igdbId: String(game.id),
            title: game.name,
            coverUrl,
            status: "BACKLOG",
            rating: null,
            notes: game.summary ? game.summary.slice(0, 500) : null,
            platform: "PS2",
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

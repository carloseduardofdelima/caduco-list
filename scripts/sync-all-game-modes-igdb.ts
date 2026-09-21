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

const MODE_TRANSLATIONS: Record<string, string> = {
  "Single player": "Singleplayer",
  "Multiplayer": "Multiplayer",
  "Co-operative": "Co-op",
  "Split screen": "Split-screen",
  "Massively Multiplayer Online (MMO)": "MMO",
  "Battle Royale": "Battle Royale",
};

const MODE_TAGS = new Set([
  "Singleplayer",
  "Multiplayer",
  "Co-op",
  "Split-screen",
  "MMO",
  "Battle Royale",
]);

async function main() {
  console.log("🚀 Iniciando sincronização 100% oficial com a IGDB para modos de jogo...");
  const token = await getTwitchToken();
  console.log("🔑 Conexão com a IGDB autenticada!");

  const allGames = await prisma.game.findMany({
    where: { igdbId: { not: null } },
    select: { id: true, igdbId: true, title: true, tags: true },
  });

  console.log(`📦 Total de jogos com ID da IGDB no banco: ${allGames.length}`);

  // Mapa de igdbId -> jogo do banco
  const dbGameMap = new Map<string, typeof allGames[0]>();
  for (const g of allGames) {
    if (g.igdbId) dbGameMap.set(g.igdbId, g);
  }

  const igdbIds = allGames.map((g) => Number(g.igdbId)).filter((id) => !isNaN(id) && id > 0);

  // Divide em lotes de 500 (limite máximo da IGDB)
  const chunkSize = 500;
  const updates: { id: string; tags: string[] }[] = [];
  let totalWithModes = 0;

  for (let i = 0; i < igdbIds.length; i += chunkSize) {
    const chunk = igdbIds.slice(i, i + chunkSize);
    console.log(`📡 Buscando lote de ${chunk.length} jogos da IGDB (${i + 1} a ${Math.min(i + chunkSize, igdbIds.length)})...`);

    const query = `
      fields id, name, game_modes.name;
      where id = (${chunk.join(",")});
      limit ${chunk.length};
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
        continue;
      }

      const igdbGames: { id: number; name: string; game_modes?: { id: number; name: string }[] }[] = await res.json();

      for (const igdbGame of igdbGames) {
        const dbGame = dbGameMap.get(String(igdbGame.id));
        if (!dbGame) continue;

        // Limpa qualquer tag antiga de modo de jogo
        const cleanTags = dbGame.tags.filter((t) => !MODE_TAGS.has(t));

        if (Array.isArray(igdbGame.game_modes) && igdbGame.game_modes.length > 0) {
          totalWithModes++;
          for (const mode of igdbGame.game_modes) {
            const mapped = MODE_TRANSLATIONS[mode.name];
            if (mapped && !cleanTags.includes(mapped)) {
              cleanTags.push(mapped);
            }
          }
        } else {
          // Se na IGDB não estiver preenchido o modo de jogo, mantemos Singleplayer como padrão de catálogo
          cleanTags.push("Singleplayer");
        }

        updates.push({ id: dbGame.id, tags: cleanTags });
      }

      await sleep(350); // Rate limit da IGDB
    } catch (err) {
      console.error("Erro ao processar lote:", err);
    }
  }

  console.log(`\n💾 Salvando ${updates.length} jogos atualizados diretamente no Neon...`);

  const batchSize = 100;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    await Promise.all(
      batch.map((u) =>
        prisma.game.update({
          where: { id: u.id },
          data: { tags: u.tags },
        })
      )
    );
    process.stdout.write(`\rProgresso Neon: ${Math.min(i + batchSize, updates.length)} / ${updates.length}`);
  }

  console.log(`\n\n🎉 Sincronização concluída com sucesso com os dados oficiais da IGDB!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

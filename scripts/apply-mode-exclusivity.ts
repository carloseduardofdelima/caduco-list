import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MULTI_TAGS = new Set(["Multiplayer", "Co-op", "Split-screen", "MMO"]);

async function main() {
  console.log("🧹 Aplicando regra de exclusividade para tags de modo de jogo...");

  const games = await prisma.game.findMany({
    select: { id: true, title: true, tags: true },
  });

  console.log(`Total de jogos analisados: ${games.length}`);

  const updates: { id: string; tags: string[] }[] = [];

  for (const game of games) {
    let tags = [...game.tags];

    // Correção específica para Aliens Versus Predator: Extinction (100% solo na realidade)
    if (game.title.toLowerCase().includes("aliens versus predator: extinction")) {
      tags = tags.filter((t) => t !== "Split-screen" && t !== "Multiplayer");
      if (!tags.includes("Singleplayer")) {
        tags.push("Singleplayer");
      }
    } else {
      const hasMultiplayer = tags.some((t) => MULTI_TAGS.has(t));

      if (hasMultiplayer && tags.includes("Singleplayer")) {
        // Se tem qualquer modo multiplayer, remove Singleplayer
        tags = tags.filter((t) => t !== "Singleplayer");
      } else if (!hasMultiplayer && !tags.includes("Singleplayer")) {
        // Se não tem multiplayer, garante Singleplayer
        tags.push("Singleplayer");
      }
    }

    if (JSON.stringify(tags) !== JSON.stringify(game.tags)) {
      updates.push({ id: game.id, tags });
    }
  }

  console.log(`💾 Atualizando ${updates.length} jogos no Neon...`);

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

  console.log("\n\n✅ Regra de exclusividade aplicada com sucesso!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

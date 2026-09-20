import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Capas oficiais extraídas diretamente da IGDB oficial (t_cover_big com box art de PS2 completa)
  const games = [
    {
      title: "Grand Theft Auto: San Andreas",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lb9.jpg",
      status: "PLAYED" as const,
      rating: 10,
      playedAt: new Date("2023-11-10"),
      notes: "O auge dos jogos de mundo aberto no PlayStation 2. CJ, Grove Street e as rádios clássicas.",
      platform: "PS2",
      tags: ["Ação", "Mundo Aberto", "Tiro"],
      isJapanOnly: false,
    },
    {
      title: "Silent Hill 2",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3weh.jpg",
      status: "PLAYED" as const,
      rating: 10,
      playedAt: new Date("2024-01-20"),
      notes: "Melhor atmosfera de terror psicológico já criada nos videogames. A história de James Sunderland é inesquecível.",
      platform: "PS2",
      tags: ["Terror", "Sobrevivência", "Psicológico"],
      isJapanOnly: false,
    },
    {
      title: "Shadow of the Colossus",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1ozz.jpg",
      status: "PLAYED" as const,
      rating: 10,
      playedAt: new Date("2024-03-15"),
      notes: "Uma obra-prima atemporal. Cada colosso é um puzzle memorável e a trilha sonora emociona.",
      platform: "PS2",
      tags: ["Ação", "Aventura", "Puzzle"],
      isJapanOnly: false,
    },
    {
      title: "Need for Speed: Underground 2",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co21z8.jpg",
      status: "PLAYED" as const,
      rating: 9,
      playedAt: new Date("2023-12-05"),
      notes: "Tuning, trilha sonora lendária de hip-hop/rock e corridas noturnas por Bayview.",
      platform: "PS2",
      tags: ["Corrida", "Arcade", "Mundo Aberto"],
      isJapanOnly: false,
    },
    {
      title: "God of War II",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3dik.jpg",
      status: "PLAYING" as const,
      rating: 9,
      playedAt: null,
      notes: "Jogando atualmente no hard. O combate é extremamente fluido e a escala dos chefes impressiona.",
      platform: "PS2",
      tags: ["Ação", "Hack and Slash", "Aventura"],
      isJapanOnly: false,
    },
    {
      title: "Initial D: Special Stage",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co204a.jpg",
      status: "PLAYING" as const,
      rating: 9,
      playedAt: null,
      notes: "Exclusivo de PS2 no Japão! Perfeito para fãs de Eurobeat, touge drifting e a lenda do AE86 no Monte Akina.",
      platform: "PS2",
      tags: ["Corrida", "Arcade", "Anime"],
      isJapanOnly: true,
    },
    {
      title: "Berserk: Millennium Falcon Hen Seima Senki no Shou",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2k0q.jpg",
      status: "BACKLOG" as const,
      rating: null,
      playedAt: null,
      notes: "Adaptação brutal e fiel do mangá de Kentaro Miura, lançada somente no Japão para PS2.",
      platform: "PS2",
      tags: ["Hack and Slash", "Ação", "Anime"],
      isJapanOnly: true,
    },
    {
      title: "Namco x Capcom",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x3t.jpg",
      status: "BACKLOG" as const,
      rating: null,
      playedAt: null,
      notes: "Crossover tático grandioso lançado exclusivamente no Japão com personagens da Capcom e Namco.",
      platform: "PS2",
      tags: ["RPG", "Estratégia", "Tático"],
      isJapanOnly: true,
    },
    {
      title: "Metal Gear Solid 3: Snake Eater",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co99jz.jpg",
      status: "BACKLOG" as const,
      rating: null,
      playedAt: null,
      notes: "Próximo da fila para jogar. Quero experimentar a batalha contra The End e o final emocionante.",
      platform: "PS2",
      tags: ["Furtividade", "Ação", "Tiro"],
      isJapanOnly: false,
    },
    {
      title: "Tekken 5",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7v.jpg",
      status: "PLAYED" as const,
      rating: 9,
      playedAt: new Date("2023-09-18"),
      notes: "Um dos maiores jogos de luta de todos os tempos. Combate impecável e modo Devil Within.",
      platform: "PS2",
      tags: ["Luta", "Arcade"],
      isJapanOnly: false,
    },
    {
      title: "Devil May Cry 3: Dante's Awakening",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1u6u.jpg",
      status: "BACKLOG" as const,
      rating: null,
      playedAt: null,
      notes: "Planejado para as próximas semanas. Hack and slash clássico.",
      platform: "PS2",
      tags: ["Hack and Slash", "Ação"],
      isJapanOnly: false,
    },
  ];

  console.log("Atualizando Neon com as capas de caixinha originais da IGDB...");
  await prisma.game.deleteMany();

  for (const game of games) {
    await prisma.game.create({
      data: game,
    });
  }
  console.log("Banco atualizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

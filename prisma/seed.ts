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
    },
    {
      title: "Silent Hill 2",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3weh.jpg",
      status: "PLAYED" as const,
      rating: 10,
      playedAt: new Date("2024-01-20"),
      notes: "Melhor atmosfera de terror psicológico já criada nos videogames. A história de James Sunderland é inesquecível.",
      platform: "PS2",
    },
    {
      title: "Shadow of the Colossus",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1ozz.jpg",
      status: "PLAYED" as const,
      rating: 10,
      playedAt: new Date("2024-03-15"),
      notes: "Uma obra-prima atemporal. Cada colosso é um puzzle memorável e a trilha sonora emociona.",
      platform: "PS2",
    },
    {
      title: "God of War II",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3dik.jpg",
      status: "PLAYING" as const,
      rating: 9,
      playedAt: null,
      notes: "Jogando atualmente no hard. O combate é extremamente fluido e a escala dos chefes impressiona.",
      platform: "PS2",
    },
    {
      title: "Metal Gear Solid 3: Snake Eater",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co99jz.jpg",
      status: "BACKLOG" as const,
      rating: null,
      playedAt: null,
      notes: "Próximo da fila para jogar. Quero experimentar a batalha contra The End e o final emocionante.",
      platform: "PS2",
    },
    {
      title: "Devil May Cry 3: Dante's Awakening",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1u6u.jpg",
      status: "BACKLOG" as const,
      rating: null,
      playedAt: null,
      notes: "Planejado para as próximas semanas. Hack and slash clássico.",
      platform: "PS2",
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

import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let games: any[] = [];
  try {
    games = await prisma.game.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 150,
    });
  } catch (err) {
    console.warn("Aviso ao carregar jogos no painel admin:", err);
  }

  // Serializa datas para componentes cliente
  const formattedGames = games.map((g) => ({
    ...g,
    playedAt: g.playedAt ? g.playedAt.toISOString() : null,
    createdAt: g.createdAt ? g.createdAt.toISOString() : null,
    updatedAt: g.updatedAt ? g.updatedAt.toISOString() : null,
  }));

  return <AdminDashboardClient initialGames={formattedGames} />;
}

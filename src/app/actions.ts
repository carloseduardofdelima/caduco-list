"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Status } from "@prisma/client";

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (!password || password !== adminPassword) {
    return { success: false, error: "Senha incorreta." };
  }

  await createSession();
  return { success: true };
}

export async function logoutAdmin() {
  await destroySession();
  redirect("/admin/login");
}

export async function createGame(data: {
  title: string;
  coverUrl?: string;
  status: Status;
  rating?: number | null;
  playedAt?: string | null;
  notes?: string | null;
  igdbId?: string | null;
  tags?: string[];
  isJapanOnly?: boolean;
  summary?: string | null;
  storyline?: string | null;
  developer?: string | null;
  publisher?: string | null;
  releaseYear?: number | null;
  screenshots?: string[];
  videoUrl?: string | null;
}) {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error("Não autorizado.");
  }

  const game = await prisma.game.create({
    data: {
      title: data.title,
      coverUrl: data.coverUrl || null,
      status: data.status,
      rating: data.rating ? Number(data.rating) : null,
      playedAt: data.playedAt ? new Date(data.playedAt) : null,
      notes: data.notes || null,
      igdbId: data.igdbId || null,
      platform: "PS2",
      tags: data.tags || [],
      isJapanOnly: data.isJapanOnly ?? false,
      summary: data.summary || null,
      storyline: data.storyline || null,
      developer: data.developer || null,
      publisher: data.publisher || null,
      releaseYear: data.releaseYear ? Number(data.releaseYear) : null,
      screenshots: data.screenshots || [],
      videoUrl: data.videoUrl || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return game;
}

export async function updateGame(
  id: string,
  data: {
    title: string;
    coverUrl?: string;
    status: Status;
    rating?: number | null;
    playedAt?: string | null;
    notes?: string | null;
    igdbId?: string | null;
    tags?: string[];
    isJapanOnly?: boolean;
    summary?: string | null;
    storyline?: string | null;
    developer?: string | null;
    publisher?: string | null;
    releaseYear?: number | null;
    screenshots?: string[];
    videoUrl?: string | null;
  }
) {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error("Não autorizado.");
  }

  const game = await prisma.game.update({
    where: { id },
    data: {
      title: data.title,
      coverUrl: data.coverUrl || null,
      status: data.status,
      rating: data.rating ? Number(data.rating) : null,
      playedAt: data.playedAt ? new Date(data.playedAt) : null,
      notes: data.notes || null,
      igdbId: data.igdbId || null,
      tags: data.tags !== undefined ? data.tags : undefined,
      isJapanOnly: data.isJapanOnly !== undefined ? data.isJapanOnly : undefined,
      summary: data.summary !== undefined ? data.summary : undefined,
      storyline: data.storyline !== undefined ? data.storyline : undefined,
      developer: data.developer !== undefined ? data.developer : undefined,
      publisher: data.publisher !== undefined ? data.publisher : undefined,
      releaseYear: data.releaseYear !== undefined ? (data.releaseYear ? Number(data.releaseYear) : null) : undefined,
      screenshots: data.screenshots !== undefined ? data.screenshots : undefined,
      videoUrl: data.videoUrl !== undefined ? data.videoUrl : undefined,
    },
  });

  revalidatePath("/");
  revalidatePath(`/jogo/${id}`);
  revalidatePath("/admin");
  return game;
}

export async function updateGameStatus(id: string, status: Status) {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error("Não autorizado.");
  }

  const game = await prisma.game.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/");
  revalidatePath(`/jogo/${id}`);
  revalidatePath("/admin");
  return game;
}

export async function deleteGame(id: string) {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error("Não autorizado.");
  }

  await prisma.game.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function seedDefaultGames() {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error("Não autorizado.");
  }

  const initialCatalog = [
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
      developer: "Rockstar North",
      publisher: "Rockstar Games",
      releaseYear: 2004,
      summary: "Cinco anos atrás, Carl Johnson fugiu das pressões de Los Santos, San Andreas... uma cidade à beira do colapso com gangues, drogas e corrupção. No início dos anos 90, CJ precisa voltar para casa.",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f2.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f3.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f1.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88ez.jpg",
      ],
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
      developer: "Team Silent",
      publisher: "Konami",
      releaseYear: 2001,
      summary: "James Sunderland recebe uma misteriosa carta de sua falecida esposa Mary, pedindo para que ele a encontre em seu 'lugar especial' na enevoada e silenciosa cidade de Silent Hill.",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc84s4.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc84s5.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc84s6.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc84s7.jpg",
      ],
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
      developer: "Team Ico / SCE Japan Studio",
      publisher: "Sony Computer Entertainment",
      releaseYear: 2005,
      summary: "Wander entra na terra proibida montado em seu cavalo Agro para ressuscitar a jovem Mono, desafiando e escalando dezesseis colossos monumentais.",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc89k2.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc89k3.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc89k4.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc89k5.jpg",
      ],
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
      developer: "EA Black Box",
      publisher: "EA Games",
      releaseYear: 2004,
      summary: "Explore a cidade de Bayview, tune dezenas de carros icônicos com personalização profunda e domine os eventos de drift, drag e sprint.",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88t4.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88t5.jpg",
      ],
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
      developer: "Santa Monica Studio",
      publisher: "Sony Computer Entertainment",
      releaseYear: 2007,
      summary: "Kratos, traído por Zeus, parte em uma jornada lendária através do tempo para desafiar o destino e destruir o Olimpo.",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6o05.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6o06.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6o07.jpg",
      ],
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
      developer: "Sega Rosso",
      publisher: "Sega",
      releaseYear: 2003,
      summary: "Exclusivo do PlayStation 2 no Japão! Corridas touge em alta velocidade nas montanhas de Akina, Myogi e Usui com Takumi Fujiwara no lendário Toyota Sprinter Trueno AE86, ao som de Eurobeat autêntico.",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc80e6.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc80e7.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc80e8.jpg",
      ],
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
      developer: "Yuke's",
      publisher: "Sammy Corporation",
      releaseYear: 2004,
      summary: "Adaptação de PS2 lançada exclusivamente no mercado japonês. Cobre os eventos brutais do mangá de Kentaro Miura com a trilha sonora épica de Susumu Hirasawa e combate intenso com a Dragon Slayer.",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f5.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f6.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f7.jpg",
      ],
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
      developer: "Monolith Soft",
      publisher: "Namco",
      releaseYear: 2005,
      summary: "Crossover lendário de RPG Tático exclusivo de PS2 no Japão que junta personagens de Street Fighter, Darkstalkers, Tekken, Megaman e Tales of.",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc8b25.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc8b26.jpg",
      ],
    },
    {
      title: "Metal Gear Solid 3: Snake Eater",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co99jz.jpg",
      status: "BACKLOG" as const,
      rating: null,
      playedAt: null,
      notes: "Próximo da fila para jogar. A batalha contra The End e o final emocionante.",
      platform: "PS2",
      tags: ["Furtividade", "Ação", "Tiro"],
      isJapanOnly: false,
      developer: "Kojima Productions / Konami",
      publisher: "Konami",
      releaseYear: 2004,
      summary: "Passado em 1964 nas profundezas da selva da União Soviética. Naked Snake deve infiltrar-se em território inimigo para resgatar o cientista Sokolov e destruir a superarma Shagohod.",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc86w2.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc86w3.jpg",
      ],
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
      developer: "Namco",
      publisher: "Namco",
      releaseYear: 2005,
      summary: "Considerado o ápice da franquia no PS2, Tekken 5 introduziu Jinpachi Mishima, novos lutadores como Raven, Feng Wei e Asuka Kazama, além do modo Devil Within.",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc81v1.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc81v2.jpg",
      ],
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
      developer: "Capcom",
      publisher: "Capcom",
      releaseYear: 2005,
      summary: "O jovem caçador de demônios Dante deve escalar a gigantesca torre Temen-ni-gru para deter os planos de seu irmão gêmeo Vergil.",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88l1.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88l2.jpg",
      ],
    },
  ];

  for (const game of initialCatalog) {
    const existing = await prisma.game.findFirst({
      where: { title: game.title },
    });
    if (!existing) {
      await prisma.game.create({
        data: game,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, count: initialCatalog.length };
}

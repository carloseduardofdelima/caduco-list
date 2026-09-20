import { NextRequest, NextResponse } from "next/server";
import { searchIGDBGames } from "@/lib/igdb";

// Busca informações e capas de jogos via IGDB (prioritário), RAWG ou Mock Fallback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // 1. Tenta buscar primeiro via IGDB (Twitch API)
  const igdbResults = await searchIGDBGames(query);
  if (igdbResults && igdbResults.length > 0) {
    return NextResponse.json({ results: igdbResults });
  }

  // 2. Se IGDB não estiver configurada ou sem resultados, tenta RAWG API
  const rawgApiKey = process.env.RAWG_API_KEY;
  if (rawgApiKey) {
    try {
      // 15 = PlayStation 2 na RAWG API
      const url = `https://api.rawg.io/api/games?key=${rawgApiKey}&search=${encodeURIComponent(
        query
      )}&platforms=15&page_size=8`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const results = (data.results || []).map((g: any) => ({
          id: String(g.id),
          title: g.name,
          coverUrl: g.background_image || null,
          rating: g.rating ? Math.round(g.rating * 2) : null,
          tags: Array.isArray(g.genres) ? g.genres.map((gen: any) => gen.name) : [],
          isJapanOnly: /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(g.name),
        }));

        if (results.length > 0) {
          return NextResponse.json({ results });
        }
      }
    } catch (err) {
      console.error("Erro ao consultar RAWG API:", err);
    }
  }

  // 3. Fallback inteligente de catálogo clássico com capas oficiais, tags e indicação de região
  const mockGames = [
    {
      id: "rawg-1",
      title: "Shadow of the Colossus",
      coverUrl: "https://media.rawg.io/media/games/6ac/6ac602e70c837ababdf025e997391d9c.jpg",
      rating: 10,
      tags: ["Ação", "Aventura", "Puzzle"],
      isJapanOnly: false,
    },
    {
      id: "rawg-2",
      title: "Silent Hill 2",
      coverUrl: "https://media.rawg.io/media/games/003/0033ae7d21418ff5a7807ab2c7d90247.jpg",
      rating: 10,
      tags: ["Terror", "Sobrevivência", "Psicológico"],
      isJapanOnly: false,
    },
    {
      id: "rawg-3",
      title: "Grand Theft Auto: San Andreas",
      coverUrl: "https://media.rawg.io/media/games/960/960b601d9541cec776c5fa42a00bf6c4.jpg",
      rating: 10,
      tags: ["Ação", "Mundo Aberto", "Tiro"],
      isJapanOnly: false,
    },
    {
      id: "rawg-4",
      title: "God of War II",
      coverUrl: "https://media.rawg.io/media/games/615/615e9fc0a325e0d87b84dad029b8b7b9.jpg",
      rating: 9,
      tags: ["Ação", "Hack and Slash", "Aventura"],
      isJapanOnly: false,
    },
    {
      id: "rawg-5",
      title: "Metal Gear Solid 3: Snake Eater",
      coverUrl: "https://media.rawg.io/media/games/2c6/2c60e20bebae94ee080bdf0993253b4d.jpg",
      rating: 10,
      tags: ["Furtividade", "Ação", "Tiro"],
      isJapanOnly: false,
    },
    {
      id: "rawg-6",
      title: "Resident Evil 4",
      coverUrl: "https://media.rawg.io/media/games/d9f/d9f9821141a021876fa5950b7db9b2dd.jpg",
      rating: 10,
      tags: ["Terror", "Ação", "Tiro", "Sobrevivência"],
      isJapanOnly: false,
    },
    {
      id: "rawg-7",
      title: "Devil May Cry 3: Dante's Awakening",
      coverUrl: "https://media.rawg.io/media/games/912/9128672600b6f23f28c438fc4963e042.jpg",
      rating: 9,
      tags: ["Hack and Slash", "Ação"],
      isJapanOnly: false,
    },
    {
      id: "rawg-8",
      title: "Need for Speed: Underground 2",
      coverUrl: "https://media.rawg.io/media/games/3b9/3b9000a6e0d9b4b0e565980a377038e8.jpg",
      rating: 9,
      tags: ["Corrida", "Arcade", "Mundo Aberto"],
      isJapanOnly: false,
    },
    {
      id: "rawg-9",
      title: "Initial D: Special Stage",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co204a.jpg",
      rating: 9,
      tags: ["Corrida", "Arcade", "Anime"],
      isJapanOnly: true,
    },
    {
      id: "rawg-10",
      title: "Berserk: Millennium Falcon Hen Seima Senki no Shou",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2k0q.jpg",
      rating: 9,
      tags: ["Hack and Slash", "Ação", "Anime"],
      isJapanOnly: true,
    },
    {
      id: "rawg-11",
      title: "Namco x Capcom",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x3t.jpg",
      rating: 8,
      tags: ["RPG", "Estratégia", "Tático"],
      isJapanOnly: true,
    },
    {
      id: "rawg-12",
      title: "Gran Turismo 4",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1xec.jpg",
      rating: 10,
      tags: ["Corrida", "Simulador"],
      isJapanOnly: false,
    },
    {
      id: "rawg-13",
      title: "Tekken 5",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7v.jpg",
      rating: 9,
      tags: ["Luta", "Arcade"],
      isJapanOnly: false,
    },
    {
      id: "rawg-14",
      title: "DoDonPachi DaiOuJou",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2gqk.jpg",
      rating: 9,
      tags: ["Arcade", "Tiro"],
      isJapanOnly: true,
    }
  ];

  const filtered = mockGames.filter((g) =>
    g.title.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json({ results: filtered });
}

import { NextRequest, NextResponse } from "next/server";
import { searchIGDBGames, CURATED_PS2_DETAILS } from "@/lib/igdb";

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
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1ozz.jpg",
      rating: 10,
      tags: ["Ação", "Aventura", "Puzzle"],
      isJapanOnly: false,
    },
    {
      id: "rawg-2",
      title: "Silent Hill 2",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3weh.jpg",
      rating: 10,
      tags: ["Terror", "Sobrevivência", "Psicológico"],
      isJapanOnly: false,
    },
    {
      id: "rawg-3",
      title: "Grand Theft Auto: San Andreas",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lb9.jpg",
      rating: 10,
      tags: ["Ação", "Mundo Aberto", "Tiro"],
      isJapanOnly: false,
    },
    {
      id: "rawg-4",
      title: "God of War II",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3dik.jpg",
      rating: 9,
      tags: ["Ação", "Hack and Slash", "Aventura"],
      isJapanOnly: false,
    },
    {
      id: "rawg-5",
      title: "Metal Gear Solid 3: Snake Eater",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co99jz.jpg",
      rating: 10,
      tags: ["Furtividade", "Ação", "Tiro"],
      isJapanOnly: false,
    },
    {
      id: "rawg-6",
      title: "Resident Evil 4",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co22j5.jpg",
      rating: 10,
      tags: ["Terror", "Ação", "Tiro", "Sobrevivência"],
      isJapanOnly: false,
    },
    {
      id: "rawg-7",
      title: "Devil May Cry 3: Dante's Awakening",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1u6u.jpg",
      rating: 9,
      tags: ["Hack and Slash", "Ação"],
      isJapanOnly: false,
    },
    {
      id: "rawg-8",
      title: "Need for Speed: Underground 2",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co21z8.jpg",
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

  const enrichedMockGames = mockGames.map((g) => {
    const clean = g.title.toLowerCase();
    const curated = CURATED_PS2_DETAILS[clean] || {};
    return {
      ...g,
      ...curated,
      coverUrl: g.coverUrl,
      title: g.title,
    };
  });

  const filtered = enrichedMockGames.filter((g) =>
    g.title.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json({ results: filtered });
}

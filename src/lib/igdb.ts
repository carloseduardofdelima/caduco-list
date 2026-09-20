let cachedToken: { token: string; expiresAt: number } | null = null;

async function getTwitchAppToken(clientId: string, clientSecret: string): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  try {
    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });

    if (!res.ok) {
      console.error("Erro ao autenticar no Twitch OAuth:", await res.text());
      return null;
    }

    const data = await res.json();
    cachedToken = {
      token: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    };
    return data.access_token;
  } catch (error) {
    console.error("Falha ao obter token da Twitch:", error);
    return null;
  }
}

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

export async function searchIGDBGames(query: string) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const token = await getTwitchAppToken(clientId, clientSecret);
  if (!token) return null;

  try {
    // 8 é o platform ID de PlayStation 2 na IGDB
    const queryBody = `
      search "${query.replace(/"/g, '\\"')}";
      fields name, cover.image_id, cover.url, total_rating, first_release_date, summary, platforms, genres.name, themes.name, release_dates.region;
      where platforms = (8);
      limit 10;
    `;

    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: queryBody,
    });

    if (!res.ok) {
      console.error("Erro na busca da IGDB:", await res.text());
      return null;
    }

    const games = await res.json();

    return games.map((game: any) => {
      let coverUrl = null;
      if (game.cover?.image_id) {
        // Resolução alta original de capa de jogo (t_cover_big ou t_720p)
        coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`;
      } else if (game.cover?.url) {
        coverUrl = game.cover.url.startsWith("//") ? `https:${game.cover.url}` : game.cover.url;
        coverUrl = coverUrl.replace("t_thumb", "t_cover_big");
      }

      // Extrai e traduz tags de gêneros e temas
      const rawTags: string[] = [];
      if (Array.isArray(game.genres)) {
        for (const g of game.genres) {
          if (g?.name) {
            rawTags.push(GENRE_TRANSLATIONS[g.name] || g.name);
          }
        }
      }
      if (Array.isArray(game.themes)) {
        for (const t of game.themes) {
          if (t?.name && GENRE_TRANSLATIONS[t.name]) {
            rawTags.push(GENRE_TRANSLATIONS[t.name]);
          }
        }
      }

      // Remove duplicatas mantendo ordem
      const tags = Array.from(new Set(rawTags));

      // Detecta se saiu exclusivamente no Japão (Região 5 da IGDB é Japão; 1=Europa, 2=América do Norte, 8=Mundial)
      let isJapanOnly = false;
      if (Array.isArray(game.release_dates) && game.release_dates.length > 0) {
        const regions = game.release_dates.map((r: any) => r.region);
        const hasJapan = regions.includes(5);
        const hasWest = regions.some((r: number) => [1, 2, 3, 4, 8].includes(r));
        if (hasJapan && !hasWest) {
          isJapanOnly = true;
        }
      }

      // Fallback para nomes em japonês / romaji típicos
      if (!isJapanOnly && /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(game.name)) {
        isJapanOnly = true;
      }

      return {
        id: String(game.id),
        title: game.name,
        coverUrl,
        rating: game.total_rating ? Math.round(game.total_rating / 10) : null,
        tags,
        isJapanOnly,
      };
    });
  } catch (err) {
    console.error("Erro ao consultar IGDB:", err);
    return null;
  }
}

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
      fields name, cover.image_id, cover.url, total_rating, first_release_date, summary, platforms;
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

      return {
        id: String(game.id),
        title: game.name,
        coverUrl,
        rating: game.total_rating ? Math.round(game.total_rating / 10) : null,
      };
    });
  } catch (err) {
    console.error("Erro ao consultar IGDB:", err);
    return null;
  }
}

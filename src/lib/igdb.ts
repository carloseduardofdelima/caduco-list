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

export interface GameDetailsResult {
  id: string;
  title: string;
  coverUrl: string | null;
  rating: number | null;
  tags: string[];
  isJapanOnly: boolean;
  summary: string | null;
  storyline: string | null;
  developer: string | null;
  publisher: string | null;
  releaseYear: number | null;
  screenshots: string[];
  videoUrl: string | null;
}

// Catálogo Curado de Fallback com Screenshots reais de Gameplay e Metadados
export const CURATED_PS2_DETAILS: Record<string, Partial<GameDetailsResult>> = {
  "grand theft auto: san andreas": {
    developer: "Rockstar North",
    publisher: "Rockstar Games",
    releaseYear: 2004,
    summary:
      "Cinco anos atrás, Carl Johnson fugiu das pressões de Los Santos, San Andreas... uma cidade à beira do colapso com gangues, drogas e corrupção. No início dos anos 90, CJ precisa voltar para casa. Sua mãe foi assassinada, sua família desmoronou e seus amigos de infância estão à beira do desastre.",
    tags: ["Ação", "Mundo Aberto", "Tiro"],
    isJapanOnly: false,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f2.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f3.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f1.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88ez.jpg",
    ],
  },
  "silent hill 2": {
    developer: "Team Silent",
    publisher: "Konami",
    releaseYear: 2001,
    summary:
      "James Sunderland recebe uma misteriosa carta de sua falecida esposa Mary, pedindo para que ele a encontre em seu 'lugar especial' na enevoada e silenciosa cidade de Silent Hill. Obra-prima do terror psicológico nos videogames.",
    tags: ["Terror", "Sobrevivência", "Psicológico"],
    isJapanOnly: false,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc84s4.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc84s5.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc84s6.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc84s7.jpg",
    ],
  },
  "shadow of the colossus": {
    developer: "Team Ico / SCE Japan Studio",
    publisher: "Sony Computer Entertainment",
    releaseYear: 2005,
    summary:
      "A jornada de um jovem chamado Wander que entra em uma terra proibida montado em seu fiel cavalo Agro para ressuscitar uma garota chamada Mono, derrotando 16 colossos ancestrais gigantescos espalhados pelas paisagens místicas.",
    tags: ["Ação", "Aventura", "Puzzle"],
    isJapanOnly: false,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc89k2.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc89k3.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc89k4.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc89k5.jpg",
    ],
  },
  "god of war ii": {
    developer: "Santa Monica Studio",
    publisher: "Sony Computer Entertainment",
    releaseYear: 2007,
    summary:
      "Kratos, agora no trono do Olimpo como Deus da Guerra, é traído por Zeus e despencado no submundo. Guiado pela Titã Gaia, Kratos viaja através do tempo e da mitologia para mudar o seu próprio destino.",
    tags: ["Ação", "Hack and Slash", "Aventura"],
    isJapanOnly: false,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6o05.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6o06.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6o07.jpg",
    ],
  },
  "initial d: special stage": {
    developer: "Sega Rosso",
    publisher: "Sega",
    releaseYear: 2003,
    summary:
      "Exclusivo do PlayStation 2 no Japão! Baseado na obra-prima de Shuichi Shigeno. Corridas touge em alta velocidade nas montanhas de Akina, Myogi e Usui com Takumi Fujiwara no lendário Toyota Sprinter Trueno AE86, ao som de Eurobeat autêntico.",
    tags: ["Corrida", "Arcade", "Anime"],
    isJapanOnly: true,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc80e6.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc80e7.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc80e8.jpg",
    ],
  },
  "berserk: millennium falcon hen seima senki no shou": {
    developer: "Yuke's",
    publisher: "Sammy Corporation",
    releaseYear: 2004,
    summary:
      "Adaptação de PS2 lançada exclusivamente no mercado japonês. Cobre os eventos brutais do mangá de Kentaro Miura da Guerra Santa e do Falcão Milenar com a trilha sonora épica de Susumu Hirasawa e combate intenso com a Dragon Slayer.",
    tags: ["Hack and Slash", "Ação", "Anime"],
    isJapanOnly: true,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f5.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f6.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88f7.jpg",
    ],
  },
  "namco x capcom": {
    developer: "Monolith Soft",
    publisher: "Namco",
    releaseYear: 2005,
    summary:
      "Crossover lendário de RPG Tático exclusivo de PS2 no Japão que junta personagens icônicos de franquias como Street Fighter, Darkstalkers, Tekken, Soulcalibur, Megaman, Tales of, Strider e Ghosts 'n Goblins.",
    tags: ["RPG", "Estratégia", "Tático"],
    isJapanOnly: true,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc8b25.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc8b26.jpg",
    ],
  },
  "need for speed: underground 2": {
    developer: "EA Black Box",
    publisher: "EA Games",
    releaseYear: 2004,
    summary:
      "A experiência definitiva de corrida e tunning noturno em mundo aberto na cidade de Bayview, com modos Circuit, Sprint, Drift, Drag e Outrun, acompanhados de uma trilha sonora memorável.",
    tags: ["Corrida", "Arcade", "Mundo Aberto"],
    isJapanOnly: false,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88t4.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88t5.jpg",
    ],
  },
  "metal gear solid 3: snake eater": {
    developer: "Kojima Productions / Konami",
    publisher: "Konami",
    releaseYear: 2004,
    summary:
      "Passado em 1964 nas profundezas da selva da União Soviética. Naked Snake deve infiltrar-se em território inimigo para resgatar o cientista Sokolov e destruir a superarma Shagohod, enfrentando sua mentora The Boss e a unidade Cobra.",
    tags: ["Furtividade", "Ação", "Tiro"],
    isJapanOnly: false,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc86w2.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc86w3.jpg",
    ],
  },
  "tekken 5": {
    developer: "Namco",
    publisher: "Namco",
    releaseYear: 2005,
    summary:
      "Considerado o ápice da franquia no PS2, Tekken 5 introduziu Jinpachi Mishima, novos lutadores como Raven, Feng Wei e Asuka Kazama, além do modo Devil Within.",
    tags: ["Luta", "Arcade"],
    isJapanOnly: false,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/misxpmknrvyjaqlt6mnj.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/ge4zst8ymicxvjmpd6wy.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/pij5pfkri23jamnnzyle.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/grxzzbxsaoytpga71hvk.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/w55bsqtnm05oolqspsgu.jpg",
    ],
  },
  "devil may cry 3: dante's awakening": {
    developer: "Capcom",
    publisher: "Capcom",
    releaseYear: 2005,
    summary:
      "O jovem e rebelde caçador de demônios Dante deve escalar a gigantesca torre Temen-ni-gru para deter os planos de seu irmão gêmeo Vergil e impedir a invasão do mundo humano.",
    tags: ["Hack and Slash", "Ação"],
    isJapanOnly: false,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88l1.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88l2.jpg",
    ],
  },
  "resident evil 4": {
    developer: "Capcom",
    publisher: "Capcom",
    releaseYear: 2005,
    summary:
      "Leon S. Kennedy viaja para uma vila isolada na Espanha em uma missão para resgatar a filha do presidente dos Estados Unidos, enfrentando o culto misterioso Los Iluminados.",
    tags: ["Terror", "Ação", "Tiro", "Sobrevivência"],
    isJapanOnly: false,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88q1.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc88q2.jpg",
    ],
  },
  "gran turismo 4": {
    developer: "Polyphony Digital",
    publisher: "Sony Computer Entertainment",
    releaseYear: 2004,
    summary:
      "O simulador definitivo de PS2 com mais de 700 veículos fielmente recriados e 51 pistas ao redor do mundo, oferecendo física automotiva sem precedentes e o modo B-Spec.",
    tags: ["Corrida", "Simulador"],
    isJapanOnly: false,
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc84t1.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc84t2.jpg",
    ],
  },
};

function parseIGDBGame(game: any): GameDetailsResult {
  let coverUrl = null;
  if (game.cover?.image_id) {
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
  if (Array.isArray(game.game_modes)) {
    const MODE_MAP: Record<string, string> = {
      "Single player": "Singleplayer",
      "Multiplayer": "Multiplayer",
      "Co-operative": "Co-op",
      "Split screen": "Split-screen",
      "Massively Multiplayer Online (MMO)": "MMO",
    };
    for (const m of game.game_modes) {
      if (m?.name && MODE_MAP[m.name]) rawTags.push(MODE_MAP[m.name]);
    }
  }
  let tags = Array.from(new Set(rawTags));
  const hasMulti = tags.some((t) => ["Multiplayer", "Co-op", "Split-screen", "MMO"].includes(t));
  if (hasMulti) {
    tags = tags.filter((t) => t !== "Singleplayer");
  } else if (!tags.includes("Singleplayer")) {
    tags.push("Singleplayer");
  }

  // Detecta se saiu exclusivamente no Japão
  let isJapanOnly = false;
  if (Array.isArray(game.release_dates) && game.release_dates.length > 0) {
    const regions = game.release_dates.map((r: any) => r.region);
    const hasJapan = regions.includes(5);
    const hasWest = regions.some((r: number) => [1, 2, 3, 4, 8].includes(r));
    if (hasJapan && !hasWest) {
      isJapanOnly = true;
    }
  }
  if (!isJapanOnly && /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(game.name)) {
    isJapanOnly = true;
  }

  // Extrai Screenshots em alta resolução (Full HD / 1080p)
  const screenshots: string[] = [];
  if (Array.isArray(game.screenshots)) {
    for (const s of game.screenshots) {
      if (s?.image_id) {
        screenshots.push(`https://images.igdb.com/igdb/image/upload/t_1080p/${s.image_id}.jpg`);
      }
    }
  }
  if (screenshots.length === 0 && Array.isArray(game.artworks)) {
    for (const a of game.artworks) {
      if (a?.image_id) {
        screenshots.push(`https://images.igdb.com/igdb/image/upload/t_1080p/${a.image_id}.jpg`);
      }
    }
  }

  // Extrai Desenvolvedora e Publicadora
  let developer: string | null = null;
  let publisher: string | null = null;
  if (Array.isArray(game.involved_companies)) {
    for (const comp of game.involved_companies) {
      if (comp.developer && comp.company?.name && !developer) {
        developer = comp.company.name;
      }
      if (comp.publisher && comp.company?.name && !publisher) {
        publisher = comp.company.name;
      }
    }
  }

  // Extrai Ano de Lançamento
  let releaseYear: number | null = null;
  if (game.first_release_date) {
    releaseYear = new Date(game.first_release_date * 1000).getFullYear();
  } else if (Array.isArray(game.release_dates) && game.release_dates[0]?.y) {
    releaseYear = game.release_dates[0].y;
  }

  // Extrai Trailer (Vídeo)
  let videoUrl: string | null = null;
  if (Array.isArray(game.videos) && game.videos[0]?.video_id) {
    videoUrl = `https://www.youtube.com/watch?v=${game.videos[0].video_id}`;
  }

  return {
    id: String(game.id),
    title: game.name,
    coverUrl,
    rating: game.total_rating ? Math.round(game.total_rating / 10) : null,
    tags,
    isJapanOnly,
    summary: game.summary || null,
    storyline: game.storyline || null,
    developer,
    publisher,
    releaseYear,
    screenshots,
    videoUrl,
  };
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
    const queryBody = `
      search "${query.replace(/"/g, '\\"')}";
      fields name, cover.image_id, cover.url, total_rating, first_release_date, summary, storyline, platforms, genres.name, themes.name, game_modes.name, release_dates.region, release_dates.y, involved_companies.developer, involved_companies.publisher, involved_companies.company.name, screenshots.image_id, artworks.image_id, videos.video_id;
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
    return games.map((game: any) => parseIGDBGame(game));
  } catch (err) {
    console.error("Erro ao consultar IGDB:", err);
    return null;
  }
}

export async function getGameExtraInfo(title: string, igdbId?: string | null): Promise<Partial<GameDetailsResult>> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  // 1. Se IGDB estiver configurada, busca os detalhes 100% autênticos da API da IGDB
  if (clientId && clientSecret) {
    const token = await getTwitchAppToken(clientId, clientSecret);
    if (token) {
      try {
        let queryBody = "";
        if (igdbId && !isNaN(Number(igdbId))) {
          queryBody = `
            fields name, cover.image_id, cover.url, total_rating, first_release_date, summary, storyline, platforms, genres.name, themes.name, game_modes.name, release_dates.region, release_dates.y, involved_companies.developer, involved_companies.publisher, involved_companies.company.name, screenshots.image_id, artworks.image_id, videos.video_id;
            where id = ${igdbId};
            limit 1;
          `;
        } else {
          queryBody = `
            search "${title.replace(/"/g, '\\"')}";
            fields name, cover.image_id, cover.url, total_rating, first_release_date, summary, storyline, platforms, genres.name, themes.name, game_modes.name, release_dates.region, release_dates.y, involved_companies.developer, involved_companies.publisher, involved_companies.company.name, screenshots.image_id, artworks.image_id, videos.video_id;
            where platforms = (8);
            limit 1;
          `;
        }

        const res = await fetch("https://api.igdb.com/v4/games", {
          method: "POST",
          headers: {
            "Client-ID": clientId,
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain",
          },
          body: queryBody,
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            return parseIGDBGame(data[0]);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes avançados na IGDB:", err);
      }
    }
  }

  // 2. Fallback somente se a API estiver inacessível
  const cleanTitle = title.trim().toLowerCase();
  for (const [key, details] of Object.entries(CURATED_PS2_DETAILS)) {
    if (cleanTitle === key || cleanTitle.includes(key) || key.includes(cleanTitle)) {
      return details;
    }
  }

  return {};
}

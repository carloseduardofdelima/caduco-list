/**
 * Utilitário para busca dinâmica e validação estrita de GIFs de gameplay para jogos de PS2.
 * Realiza limpeza do título e validação de relevância para evitar GIFs incorretos.
 */

const memoryCache = new Map<string, string[]>();

function cleanGameTitle(title: string): string {
  return title
    .replace(
      /\b(limited|special|collector'?s?|gold|platinum|greatest hits|deluxe|complete|remastered|hd|edition|version|the best|japan|usa|pal)\b/gi,
      ""
    )
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSignificantKeywords(title: string): string[] {
  const clean = cleanGameTitle(title).toLowerCase();
  const stopWords = new Set([
    "the",
    "of",
    "and",
    "a",
    "an",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "by",
    "ps2",
    "playstation",
    "game",
    "gameplay",
    "ii",
    "iii",
    "iv",
    "v",
    "vi",
    "2",
    "3",
    "4",
    "5",
    "6",
  ]);
  return clean.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
}

function isRelevantSlug(slug: string, title: string): boolean {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const cleanTitle = title.toLowerCase();

  // Mapeamentos de franquias e personagens icônicos
  if (
    cleanTitle.includes("shadow of the colossus") &&
    (cleanSlug.includes("colossus") ||
      cleanSlug.includes("sotc") ||
      cleanSlug.includes("wander") ||
      cleanSlug.includes("agro"))
  )
    return true;

  if (
    cleanTitle.includes("grand theft auto") &&
    (cleanSlug.includes("gta") ||
      cleanSlug.includes("san-andreas") ||
      cleanSlug.includes("vice-city") ||
      cleanSlug.includes("carl-johnson") ||
      cleanSlug.includes("cj"))
  )
    return true;

  if (
    cleanTitle.includes("god of war") &&
    (cleanSlug.includes("kratos") ||
      cleanSlug.includes("gow") ||
      (cleanSlug.includes("god") && cleanSlug.includes("war")))
  )
    return true;

  if (
    cleanTitle.includes("devil may cry") &&
    (cleanSlug.includes("dmc") ||
      cleanSlug.includes("dante") ||
      cleanSlug.includes("vergil") ||
      cleanSlug.includes("sparda"))
  )
    return true;

  if (
    cleanTitle.includes("metal gear") &&
    (cleanSlug.includes("mgs") ||
      cleanSlug.includes("snake") ||
      cleanSlug.includes("big-boss") ||
      (cleanSlug.includes("metal") && cleanSlug.includes("gear")))
  )
    return true;

  if (
    cleanTitle.includes("resident evil") &&
    (cleanSlug.includes("re4") ||
      cleanSlug.includes("leon") ||
      cleanSlug.includes("ada-wong") ||
      cleanSlug.includes("nemesis") ||
      (cleanSlug.includes("resident") && cleanSlug.includes("evil")))
  )
    return true;

  if (
    cleanTitle.includes("silent hill") &&
    ((cleanSlug.includes("silent") && cleanSlug.includes("hill")) ||
      cleanSlug.includes("pyramid-head") ||
      cleanSlug.includes("james-sunderland") ||
      cleanSlug.includes("heather"))
  )
    return true;

  if (
    cleanTitle.includes("need for speed") &&
    (cleanSlug.includes("nfs") ||
      (cleanSlug.includes("need") && cleanSlug.includes("speed")))
  )
    return true;

  if (cleanTitle.includes("tekken") && cleanSlug.includes("tekken"))
    return true;

  if (
    cleanTitle.includes("initial d") &&
    (cleanSlug.includes("initial-d") ||
      cleanSlug.includes("takumi") ||
      cleanSlug.includes("ae86"))
  )
    return true;

  if (
    cleanTitle.includes("berserk") &&
    (cleanSlug.includes("berserk") ||
      cleanSlug.includes("guts") ||
      cleanSlug.includes("griffith"))
  )
    return true;

  if (
    cleanTitle.includes("kingdom hearts") &&
    (cleanSlug.includes("kingdom-hearts") ||
      cleanSlug.includes("sora") ||
      cleanSlug.includes("riku") ||
      cleanSlug.includes("roxas"))
  )
    return true;

  if (
    cleanTitle.includes("crash bandicoot") &&
    (cleanSlug.includes("crash") || cleanSlug.includes("bandicoot"))
  )
    return true;

  if (
    cleanTitle.includes("final fantasy") &&
    (cleanSlug.includes("final-fantasy") ||
      cleanSlug.includes("tidus") ||
      cleanSlug.includes("yuna") ||
      cleanSlug.includes("ffx") ||
      cleanSlug.includes("ffxii"))
  )
    return true;

  const keywords = getSignificantKeywords(title);
  if (keywords.length === 0) return false;

  const matchedKeywords = keywords.filter((kw) => cleanSlug.includes(kw));

  if (keywords.length === 1) {
    return matchedKeywords.length === 1;
  }

  // Para jogos com múltiplos termos no nome, exige pelo menos 2 palavras-chave ou 60%
  return matchedKeywords.length >= Math.min(2, Math.ceil(keywords.length * 0.6));
}

export async function getGameGifs(title: string): Promise<string[]> {
  if (!title) return [];

  const cacheKey = title.trim().toLowerCase();
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  const clean = cleanGameTitle(title);
  const searchQueries = [
    `${clean} ps2 gameplay`,
    `${clean} ps2 game`,
    `${clean} ps2`,
    `${clean} gameplay`,
    clean,
  ];

  const foundUrls: string[] = [];

  // 1. Busca no Tenor com validação estrita de cada GIF
  for (const q of searchQueries) {
    if (foundUrls.length >= 2) break;
    try {
      const url = `https://tenor.com/search/${encodeURIComponent(
        q.replace(/\s+/g, "-")
      )}-gifs`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
        next: { revalidate: 86400 },
      });

      if (res.ok) {
        const html = await res.text();
        const matches = [
          ...html.matchAll(
            /https:\/\/media\.tenor\.com\/[a-zA-Z0-9_\-\/]+AAAAM\/([a-zA-Z0-9_\-]+)\.gif/g
          ),
        ];

        for (const m of matches) {
          // Converte para resolução máxima (AAAAC = Full HD em vez de AAAAM = Médio)
          const fullUrl = m[0].replace("/AAAAM/", "/AAAAC/");
          const slug = m[1];

          if (isRelevantSlug(slug, title)) {
            if (!foundUrls.includes(fullUrl)) {
              foundUrls.push(fullUrl);
              if (foundUrls.length >= 2) break;
            }
          }
        }
      }
    } catch (e) {
      // Ignora falha de rede
    }
  }

  // 2. Fallback para Giphy com validação estrita
  if (foundUrls.length === 0) {
    for (const q of searchQueries) {
      if (foundUrls.length >= 2) break;
      try {
        const url = `https://giphy.com/search/${encodeURIComponent(
          q.replace(/\s+/g, "-")
        )}`;
        const res = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          next: { revalidate: 86400 },
        });

        if (res.ok) {
          const html = await res.text();
          const matches = [
            ...html.matchAll(
              /https:\/\/media[0-9]*\.giphy\.com\/media\/([a-zA-Z0-9_-]+)\/(giphy|200)\.gif/g
            ),
          ];

          for (const m of matches) {
            // Converte para tamanho completo
            const fullUrl = m[0].replace("/200.gif", "/giphy.gif");
            const slug = m[1];

            if (isRelevantSlug(slug, title)) {
              if (!foundUrls.includes(fullUrl)) {
                foundUrls.push(fullUrl);
                if (foundUrls.length >= 2) break;
              }
            }
          }
        }
      } catch (e) {
        // Ignora erro
      }
    }
  }

  if (foundUrls.length > 0) {
    memoryCache.set(cacheKey, foundUrls);
  }

  return foundUrls;
}

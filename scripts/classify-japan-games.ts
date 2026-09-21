import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Lista expressa de jogos que NÃO são exclusivos do Japão (garantia anti-falso-positivo)
const WESTERN_RELEASES_WHITELIST = new Set([
  "grand theft auto",
  "god of war",
  "metal gear solid",
  "final fantasy",
  "silent hill",
  "resident evil",
  "devil may cry",
  "crash bandicoot",
  "gran turismo",
  "kingdom hearts",
  "dragon quest viii",
  "burnout",
  "need for speed",
  "tony hawk",
  "ssx",
  "ratchet & clank",
  "jak and daxter",
  "sly cooper",
  "mortal kombat",
  "tekken 4",
  "tekken 5",
  "tekken tag tournament",
  "virtua fighter 4",
  "soulcalibur",
  "castlevania",
  "shadow of the colossus",
  "ico",
  "okami",
  "killzone",
  "bully",
  "canis canem edit",
  "midnight club",
  "black",
  "guitar hero",
  "def jam",
  "manhunt",
  "max payne",
  "prince of persia",
  "beyond good & evil",
  "hitman",
  "splinter cell",
  "call of duty",
  "medal of honor",
  "battlefield",
  "tomb raider",
  "persona 3",
  "persona 4",
  "shin megami tensei: nocturne",
  "shin megami tensei: digital devil saga",
  "suikoden iii",
  "suikoden iv",
  "suikoden v",
  "disgaea",
  "katamari damacy",
  "we love katamari",
  "shadow hearts",
  "xenosaga",
  "dragon ball z: budokai",
  "dragon ball z: budokai tenkaichi",
  "naruto: ultimate ninja",
  "time crisis",
]);

// Frases e termos em resumo que indicam exclusividade
const EXCLUSIVE_SUMMARY_REGEX = /\b(japan[\s-]only|only in japan|exclusivo (?:do|no) jap[aã]o|lançado exclusivamente no jap[aã]o|exclusive to japan|released exclusively in japan|exclusive to the japanese market|only released in japan)\b/i;

// Séries 100% exclusivas do Japão no PS2
const EXCLUSIVE_SERIES_PATTERNS = [
  /\bsimple 2000 series\b/i,
  /\bsuperlite 2000\b/i,
  /\bsuper robot (?:wars|taisen)\b/i,
  /\bdai-\d+-ji super robot\b/i,
  /\bdensha de go\b/i,
  /\btrain simulator\b/i,
  /\binitial d\b/i,
  /\bkaido battle\b/i,
  /\bwangan midnight\b/i,
  /\bsakura (?:taisen|wars)\b/i,
  /\bpro yakyuu spirits\b/i,
  /\bjikkyou powerful pro\b/i,
  /\bpowerful pro yakyuu\b/i,
  /\bpop'n music\b/i,
  /\bbeatmania iidx\b/i,
  /\bguitarfreaks\b/i,
  /\bdrummania\b/i,
  /\btokimeki memorial\b/i,
  /\bhigurashi no naku koro ni\b/i,
  /\bumineko no naku koro ni\b/i,
  /\bmelty blood: act cadenza\b/i,
  /\bfate\/stay night\b/i,
  /\bfate\/unlimited codes\b/i,
  /\bnamco x capcom\b/i,
  /\bberserk: millennium falcon\b/i,
  /\bsengoku basara 2\b/i,
  /\bsengoku basara x\b/i,
  /\btales of (?:rebirth|destiny 2|destiny remake|fandom)\b/i,
  /\bkurogane no houkou\b/i,
  /\bgakuen heaven\b/i,
  /\bhakuouki\b/i,
  /\bkiniro no corda\b/i,
  /\bla corda d'oro\b/i,
  /\bharukanaru toki no naka de\b/i,
  /\bbusou renkin\b/i,
  /\bshaman king: funbari spirits\b/i,
  /\bbobobo-bo bo-bobo\b/i,
  /\bkonjiki no gashbell\b/i,
  /\beyeshield 21\b/i,
  /\bmajor: /i,
  /\btennis no oujisama\b/i,
  /\bprince of tennis\b/i,
  /\bkeroro gunso\b/i,
  /\bkeroro gunsou\b/i,
  /\bsaint seiya: the hades\b/i,
  /\bshining force (?:feather|neo|tears)\b/i,
  /\bmemories off\b/i,
  /\bto heart 2\b/i,
  /\bamagami\b/i,
  /\bkimikiss\b/i,
  /\bda capo\b/i,
  /\bpachinko\b/i,
  /\bpachi-slot\b/i,
  /\bpachislot\b/i,
  /\bmahjong\b/i,
  /\bmah-jong\b/i,
  /\bhanafuda\b/i,
  /\bshogi\b/i,
  /\bigo\b/i,
];

// Padrões de gramática e títulos japoneses romanizados
const JAPANESE_GRAMMAR_PATTERNS = [
  /\b(?:no|he no|ni|wo|ga|wa|to) (?:bouken|densetsu|shou|hime|tsubasa|kiseki|daibouken|ken|uta|yabou|shiro|natsu|toki|mori|kizuna|chikai|tame ni|yoru|hon|hoshi|sekai|michi|sora|tabibito|yuusha)\b/i,
  /\b(?:dai-\d+-ji|gekitou|kakusei|rengou|meikyuu|seisenshi|kessen|musou|ranbu|renka|biyori|koushien|kyousoukyoku|kousou|shinigami)\b/i,
  /\b(?:kidou senshi|gundam seed: rengou|gundam climax|sd gundam g generation)\b/i,
  /\b(?:shinseiki evangelion|suzumiya haruhi no|raki suta|lucky star)\b/i,
];

// Caracteres ideográficos ou símbolos orientais
const JAPANESE_CHARS_REGEX = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/;

export function isGameJapanExclusive(game: {
  title: string;
  summary?: string | null;
  developer?: string | null;
  publisher?: string | null;
}): boolean {
  const titleLower = game.title.toLowerCase();

  // Se está na whitelist expressa de clássicos ocidentais conhecidos, nunca é Japan-only
  for (const w of WESTERN_RELEASES_WHITELIST) {
    if (titleLower.includes(w)) {
      // Exceções conhecidas dentro das franquias (ex: Tales of Rebirth)
      if (titleLower.includes("tales of rebirth") || titleLower.includes("tales of destiny 2")) {
        return true;
      }
      return false;
    }
  }

  // 1. Resumo declarando explicitamente ser exclusivo do Japão
  if (game.summary && EXCLUSIVE_SUMMARY_REGEX.test(game.summary)) {
    return true;
  }

  // 2. Ideogramas ou caracteres fullwidth japoneses
  if (JAPANESE_CHARS_REGEX.test(game.title)) {
    return true;
  }

  // 3. Séries e franquias sabidamente exclusivas do Japão
  for (const pat of EXCLUSIVE_SERIES_PATTERNS) {
    if (pat.test(game.title)) {
      return true;
    }
  }

  // 4. Padrões gramaticais/vocabulário específico de jogos japoneses
  for (const pat of JAPANESE_GRAMMAR_PATTERNS) {
    if (pat.test(game.title)) {
      return true;
    }
  }

  return false;
}

async function run() {
  console.log("🔍 Analisando todos os jogos no banco de dados...");
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true,
      summary: true,
      developer: true,
      publisher: true,
      isJapanOnly: true,
    },
  });

  console.log(`Total de jogos no banco: ${games.length}`);

  const toUpdate: string[] = [];
  const samples: string[] = [];

  for (const game of games) {
    const isJapan = isGameJapanExclusive(game);
    if (isJapan) {
      toUpdate.push(game.id);
      if (samples.length < 30) {
        samples.push(game.title);
      }
    }
  }

  console.log(`\n🎌 Jogos identificados como Exclusivos do Japão: ${toUpdate.length}`);
  console.log("Amostra dos primeiros 30 jogos detectados:");
  samples.forEach((s, idx) => console.log(`  ${idx + 1}. ${s}`));

  // Executa o update em batch
  if (toUpdate.length > 0) {
    console.log("\n💾 Atualizando registros no Neon...");
    const updated = await prisma.game.updateMany({
      where: {
        id: { in: toUpdate },
      },
      data: {
        isJapanOnly: true,
      },
    });
    console.log(`✅ ${updated.count} jogos atualizados como Exclusivo do Japão com sucesso!`);
  }
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

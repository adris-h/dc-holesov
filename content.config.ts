import { defineContentConfig, defineCollection, z } from '@nuxt/content'

// Celoroční tabulka (např. Putovní pohár) – volitelná součást turnaje
const standingsSchema = z.object({
  title: z.string(),
  year: z.number(),
  // Jednotlivá kola v pořadí sloupců. podium = [1., 2., 3. místo] (jména přesně jako v rows)
  rounds: z.array(z.object({
    date: z.string(), // ISO
    podium: z.array(z.string()).max(3).optional(),
  })),
  // scores: body v pořadí kol, null = nehrál. Součet a pořadí se počítají automaticky.
  rows: z.array(z.object({
    name: z.string(),
    scores: z.array(z.number().nullable()),
  })),
})

export default defineContentConfig({
  collections: {
    // content/tournaments/*.md
    tournaments: defineCollection({
      type: 'page',
      source: 'tournaments/*.md',
      schema: z.object({
        title: z.string(),
        date: z.string(), // ISO, např. 2027-01-04
        time: z.string(), // 13:00
        place: z.string(),
        placeSub: z.string().optional(),
        fee: z.number().optional(), // Kč, vynech u ligových zápasů
        capacity: z.number().optional(),
        registered: z.number().optional(),
        deadline: z.string().optional(), // ISO
        checkin: z.string().optional(), // např. 12:15 – 12:45
        status: z.enum(['open', 'league', 'soon', 'closed']),
        lead: z.string().optional(),
        advances: z.number().optional(),
        standings: standingsSchema.optional(),
      }),
    }),

    // content/league/*.md – ligová sezóna (tabulka, soupiska, rozpis). Zobrazí se nejnovější soubor.
    league: defineCollection({
      type: 'page',
      source: 'league/*.md',
      schema: z.object({
        title: z.string(),
        season: z.string(), // např. 2026/27
        us: z.string(), // název našeho týmu v tabulce
        captain: z.string(),
        venue: z.string(),
        teamUrl: z.string(),
        tableUrl: z.string(),
        updated: z.string(), // ISO – ke kdy platí tabulka
        players: z.array(z.string()),
        table: z.array(z.object({
          pos: z.number(),
          team: z.string(),
          z: z.number(),
          v: z.number(),
          r: z.number(),
          p: z.number(),
          matches: z.string(),
          legs: z.string(),
          pts: z.number(),
        })),
        matches: z.array(z.object({
          round: z.number(),
          date: z.string(), // ISO
          time: z.string(),
          opponent: z.string(),
          home: z.boolean(),
          score: z.string().optional(), // z pohledu našeho týmu
          url: z.string().optional(),
        })),
      }),
    }),

    // content/news/*.md
    news: defineCollection({
      type: 'page',
      source: 'news/*.md',
      schema: z.object({
        title: z.string(),
        date: z.string(), // ISO
        perex: z.string(),
      }),
    }),

    // content/pages/*.md (statické texty)
    pages: defineCollection({
      type: 'page',
      source: 'pages/*.md',
      schema: z.object({
        title: z.string(),
        lead: z.string().optional(),
        // Řádky v infoboxu vedle textu (k = popisek, v = hodnota)
        facts: z.array(z.object({ k: z.string(), v: z.string() })).optional(),
        // Vedení klubu – karty
        board: z.array(z.object({ name: z.string(), role: z.string() })).optional(),
        // Sponzoři – jen loga. logo = cesta v /public (např. /sponsors/mesto-holesov.png)
        sponsors: z.array(z.object({
          name: z.string(), // alt text
          logo: z.string(),
          url: z.string().optional(),
        })).optional(),
      }),
    }),
  },
})

import { defineContentConfig, defineCollection, z } from '@nuxt/content'

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
      }),
    }),
  },
})

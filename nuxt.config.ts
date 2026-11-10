// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss', '@nuxt/eslint'],
  app: {
    head: {
      htmlAttrs: { lang: 'cs' },
      bodyAttrs: { class: 'bg-bg font-sans text-base font-normal leading-normal text-ink antialiased' },
      title: 'DC Holešov',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Šipkový klub DC Holešov – turnaje, výsledky, 2. liga ČŠO.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@200;300;400;500&display=swap',
        },
      ],
    },
  },
})
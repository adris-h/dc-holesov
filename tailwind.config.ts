import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        // pozadí stránky a plochy
        bg: { DEFAULT: '#F4F4F2', 2: '#ECECE8' },
        surface: '#FBFBFA',
        // tmavé karty / sekce
        night: { DEFAULT: '#121315', card: '#1A1B1E' },
        // dartová červená
        accent: { DEFAULT: '#C8281E', dark: '#A21F16', tint: '#FBECEA', bright: '#E5483C' },
        // text
        ink: { DEFAULT: '#121315', 2: '#3A3C40', 3: '#5F6166' },
        // linky
        line: { DEFAULT: '#E6E6E3', strong: '#CFCFCB' },
      },
      fontFamily: {
        sans: ['Lexend', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.04em',
        tight2: '-0.02em',
      },
    },
  },
} satisfies Config

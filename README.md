# DC Holešov – Nuxt prototype

Statický prototyp (bez funkcionality). Obsah je v markdownu přes `@nuxt/content`.
Styling výhradně přes Tailwind (`@nuxtjs/tailwindcss`), žádné vlastní CSS.
Design (podle návrhu ve Figmě): tmavé karty, plochá hlavička se záložkami, tmavá patička, nadpisy ve dvou řádcích. Tokeny (barvy `bg`, `surface`, `night`, `accent`, `ink`, `line`; font Lexend) jsou v `tailwind.config.ts`.

```bash
npm install
npm run dev
```

## Přidání obsahu

| Co | Kam | Poznámka |
|---|---|---|
| Turnaj / ligový zápas | `content/tournaments/<slug>.md` | frontmatter viz `content.config.ts`, tělo = propozice |
| Novinka | `content/news/<slug>.md` | `title`, `date`, `perex` |
| Text stránky | `content/pages/<slug>.md` | zatím `o-klubu` |

Nový soubor se objeví v kalendáři / na úvodu automaticky.
Úvodní karta zobrazuje nejbližší turnaj se `status: open`.

Volitelné pole `checkin` (čas prezentace) se zobrazí v tmavé kartě na úvodu.

Hodnoty `status`: `open`, `league`, `soon`, `closed`.

## Komponenty

`AppHeader`, `AppFooter`, `AppButton`, `AppCard`, `AppSection`, `AppTable`, `FormField`, `Prose` (stylování markdownu), `Headline` (dvouřádkový nadpis), `InfoCard`, `TournamentHero`, `TournamentRow`, `PageHead`.

## Stránky

`/`, `/vysledky`, `/liga`, `/o-klubu`, `/kalendar`, `/kalendar/:slug`, `/kontakt`, `/prihlasit`

Výsledky, liga, kontakt a přihlášky jsou zatím statické (natvrdo ve Vue souborech).

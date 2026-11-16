# DC Holešov – Nuxt prototype

Statický prototyp (bez funkcionality). Obsah je v markdownu přes `@nuxt/content`.
Styling výhradně přes Tailwind (`@nuxtjs/tailwindcss`), žádné vlastní CSS.
Design (podle návrhu ve Figmě): tmavé karty, plochá hlavička se záložkami, tmavá patička, nadpisy ve dvou řádcích. Tokeny (barvy `bg`, `surface`, `night`, `accent`, `ink`, `line`; font Lexend) jsou v `tailwind.config.ts`.

```bash
npm install
npm run dev
```

## Přidání obsahu

Veškerý obsah je v markdownu (do budoucna nahrávaný přes admin účet).

| Co | Kam | Poznámka |
|---|---|---|
| Turnaj / ligový zápas | `content/tournaments/<slug>.md` | frontmatter viz `content.config.ts`, tělo = propozice |
| Novinka | `content/news/<slug>.md` | `title`, `date`, `perex` |
| Text stránky | `content/pages/<slug>.md` | zatím `o-klubu`; volitelně `facts`, `board`, `sponsors` |
| Liga (tabulka, soupiska, rozpis) | `content/league/<sezona>.md` | např. `zlinsko-2026-27`; používá `/liga` i úvodní stránka (náhled tabulky, další zápas) |

Nový soubor se objeví v kalendáři / na úvodu automaticky.
Úvodní karta zobrazuje nejbližší turnaj se `status: open`.

Detail turnaje (`/kalendar/<slug>`) zobrazí všechna vyplněná pole (datum, místo, startovné, postup, prezentace, uzávěrka, kapacita, stav), propozice, přihlášku a – pokud má turnaj ve frontmatteru pole `standings` – i průběžnou celoroční tabulku. Na `/vysledky` se zobrazí tabulka s nejnovějším `standings.year`.

### O klubu (`content/pages/o-klubu.md`)

- `facts` – řádky infoboxu vedle textu (`k` popisek, `v` hodnota)
- `board` – vedení klubu (`name`, `role`)
- `sponsors` – jen loga: `name` (alt), `logo` (cesta v `public/`, např. `/sponsors/mesto-holesov.png`), volitelně `url`

### Celoroční tabulka (`standings` ve frontmatteru turnaje, např. `content/tournaments/putovni-pohar.md`)

- `rounds` – kola v pořadí sloupců: `date` (ISO) a `podium` (jména na 1.–3. místě, přesně jako v `rows`)
- `rows` – `name` a `scores` (body za každé kolo, `null` = nehrál)
- Součet, pořadí (sdílené při shodě) a „Poslední turnaj“ se počítají automaticky. Nové kolo = přidat položku do `rounds` a hodnotu na konec každého `scores`.
- Tabulku vykresluje komponenta `StandingsTable` (použitá na `/vysledky` i v detailu turnaje).

V markdownu fungují nadpisy, seznamy, tabulky, citace, odkazy, obrázky a komponenta `::callout{title="…" tone="accent"}` (tóny: `default`, `accent`, `dark`). Styl je v `components/Prose.vue` a `components/content/Callout.vue`.

Volitelné pole `checkin` (čas prezentace) se zobrazí v tmavé kartě na úvodu.

Hodnoty `status`: `open`, `league`, `soon`, `closed`.

## Komponenty

`AppHeader`, `AppFooter`, `AppButton`, `AppCard`, `AppSection`, `AppTable`, `FormField`, `Prose` (stylování markdownu), `Headline` (dvouřádkový nadpis), `InfoCard`, `TournamentHero`, `TournamentRow`, `PageHead`, `StandingsTable` (celoroční tabulka s vyznačením 1.–3. místa).

## Stránky

`/`, `/vysledky`, `/liga`, `/o-klubu`, `/kalendar`, `/kalendar/:slug`, `/kontakt`, `/prihlasit`

Kontakt a přihlášky jsou zatím statické. Liga čte `content/league`, výsledky a „Poslední výsledek“ na úvodu čtou pole `standings` z turnajů.

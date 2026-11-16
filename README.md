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

`/`, `/vysledky`, `/liga`, `/o-klubu`, `/kalendar`, `/kalendar/:slug`, `/kontakt`, `/prihlasit`, `/registrace`, `/ucet`, `/admin`

Kontakt je zatím statický. Přihlášky na turnaje běží přes Firebase (viz níže). Liga čte `content/league`, výsledky a „Poslední výsledek“ na úvodu čtou pole `standings` z turnajů.

## Firebase – účty a přihlášky na turnaje

Web je statický (GitHub Pages), Firebase se volá jen z prohlížeče (`plugins/firebase.client.ts`). Konfigurace je v `.env` (`NUXT_PUBLIC_FIREBASE_*`).

**Jak to funguje**

1. **Účet si může založit kdokoli** na `/registrace` (jméno, e-mail, heslo, volitelně přezdívka a klub). Na `/ucet` upraví profil a vidí své přihlášky.
2. Hráč vyplní formulář na `/kalendar/<slug>` → vznikne přihláška se stavem `pending`. Přihlášenému se formulář předvyplní z profilu a přihláška se naváže na jeho účet (`uid`). Přihlásit se na turnaj jde i bez účtu.
3. **Pořadatel (admin)** se přihlásí stejně jako ostatní; admin práva má jen ten, komu je ručně přidělíte ve Firebase (viz níže). Na `/admin` přihlášky přijme / odmítne / smaže.
4. Přijaté přihlášky se hned (živě) zobrazí v seznamu na stránce turnaje a v počtech v kalendáři. Kapacita se bere z `capacity` ve frontmatteru turnaje. Hráč může svou čekající přihlášku na `/ucet` stáhnout.

**Data ve Firestore**

| Kolekce | Obsah | Kdo čte |
|---|---|---|
| `users/{uid}` | profil: `name`, `nickname`, `club`, `createdAt`, `updatedAt` | jen vlastník (a admin) |
| `registrations/{id}` | `tournament` (slug), `name`, `nickname`, `club`, `status` (`pending`/`accepted`/`rejected`), `uid` (pokud z účtu), `createdAt`, `decidedAt` | veřejně jen `accepted`, vlastník své, admin vše |
| `registrationContacts/{id}` | `contact` (e-mail/telefon), `tournament` – stejné id jako přihláška | jen admin |
| `admins/{uid}` | prázdný dokument = uživatel je pořadatel (zakládá se jen ručně v konzoli) | jen daný uživatel |

Pravidla jsou v `firestore.rules`. Kód: `composables/useAuth.ts`, `composables/useProfile.ts`, `composables/useRegistrations.ts`.

**Jednorázové nastavení**

1. Firebase konzole → **Authentication** → Sign-in method → zapnout **Email/Password**.
2. Pořadatel si založí účet na webu (`/registrace`) – nebo ho přidáte v Authentication → Users → **Add user**. V Authentication → Users zkopírujte jeho **User UID**.
3. **Firestore Database** → vytvořit databázi (pokud není) → kolekce `admins` → dokument s ID = zkopírované UID (stačí bez polí, nebo např. `name: "Dalibor"`). Po obnovení stránky uvidí v hlavičce „Administrace“.
4. Firestore → **Rules** → vložit obsah `firestore.rules` → Publish.
   (Nebo přes CLI: `npm i -g firebase-tools`, `firebase login`, `firebase use --add`, `firebase deploy --only firestore:rules`.)
5. Authentication → Settings → **Authorized domains** → přidat doménu webu (např. `<uživatel>.github.io`).

6. GitHub repozitář → Settings → Secrets and variables → **Actions** → přidat 6 secrets se stejnými názvy a hodnotami jako v `.env` (`NUXT_PUBLIC_FIREBASE_API_KEY`, …). Workflow `deploy.yml` je předá do `nuxt generate`.

Další pořadatel = kroky 2–3. Odebrání práv = smazat jeho dokument v `admins`.

Volitelně: Authentication → Templates → upravit texty e-mailů (ověření účtu, reset hesla) – posílají se česky.


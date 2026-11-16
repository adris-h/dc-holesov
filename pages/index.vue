<script setup lang="ts">
const today = new Date().toISOString().slice(0, 10)

const { data: upcoming } = await useAsyncData('upcoming', async () => {
  const all = await queryCollection('tournaments').order('date', 'ASC').all()
  return all.filter((t) => t.date >= today)
})
const next = computed(() => upcoming.value?.find((t) => t.status === 'open') ?? null)

const { data: news } = await useAsyncData('latest-news', () =>
  queryCollection('news').order('date', 'DESC').limit(3).all(),
)

// ---- 2. liga (content/league/*.md) ----
const { data: league } = await useAsyncData('league', () =>
  queryCollection('league').order('season', 'DESC').first(),
)
// Náhled tabulky: první tři + náš tým, pokud mezi nimi není
const leaguePreview = computed(() => {
  const table = league.value?.table ?? []
  const top = table.slice(0, 3)
  const ours = table.find((r) => r.team === league.value?.us)
  return ours && !top.includes(ours) ? [...top, ours] : top
})
// Další neodehraný zápas
const nextMatch = computed(() => league.value?.matches.find((m) => !m.score && m.date >= today) ?? null)
const teams = computed(() => {
  const m = nextMatch.value
  if (!m || !league.value) return []
  return m.home ? [league.value.us, m.opponent] : [m.opponent, league.value.us]
})

// ---- Poslední výsledek: vítěz posledního odehraného turnaje (pole standings u turnajů) ----
const { data: lastResult } = await useAsyncData('last-result', async () => {
  const all = await queryCollection('tournaments').all()
  const withStandings = all.filter((t) => t.standings).sort((a, b) => b.standings!.year - a.standings!.year)
  const t = withStandings[0]
  const s = t?.standings
  if (!t || !s) return null
  for (let i = s.rounds.length - 1; i >= 0; i--) {
    const winner = s.rounds[i]?.podium?.[0]
    if (!winner) continue
    const pts = s.rows.find((r) => r.name === winner)?.scores[i] ?? null
    // „Král Petr“ -> „Petr Král“
    const parts = winner.split(' ')
    const name = parts.length > 1 ? `${parts.slice(1).join(' ')} ${parts[0]}` : winner
    return { name, pts, date: s.rounds[i]!.date, title: t.title, slug: slugFromStem(t.stem as string) }
  }
  return null
})
const facts = [
  { k: 'Kde hrajeme', v: 'Bowling Club Holešov' },
  { k: 'Soutěže', v: 'Otevřené turnaje, 2. liga ČŠO' },
  { k: 'Pro koho', v: 'Začátečníci i zkušení hráči' },
]

const box = 'rounded-[10px] border border-line bg-surface px-[22px] py-5'
const link = 'text-[13px] text-accent-dark hover:underline'

</script>

<template>
  <div>
    <TournamentHero v-if="next" v-bind="next" :slug="slugFromStem(next.stem as string)" />
    <div v-else class="pt-16" />



    <!-- BENTO -->
    <section class="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-5 md:px-20">
      <div class="flex flex-wrap gap-3">
        <div :class="[box, 'min-w-0 flex-[1.4_1_420px] pb-3']">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-[15px]">2. liga ČŠO</span>
            <NuxtLink to="/liga" :class="link">Celá tabulka</NuxtLink>
          </div>
          <table class="w-full border-collapse text-[15px] tabular-nums">
            <tbody>
              <tr
                v-for="r in leaguePreview"
                :key="r.team"
                class="[&:not(:first-child)>td]:border-t [&>td]:border-line [&>td]:py-3.5"
                :class="r.team === league?.us ? 'font-medium' : ''"
              >
                <td class="w-8" :class="r.team === league?.us || r.pos === 1 ? 'text-accent' : 'text-ink-3'">{{ r.pos }}.</td>
                <td>{{ r.team }}</td>
                <td class="text-right font-normal text-ink-3">{{ r.z }} zápasů</td>
                <td class="w-14 text-right font-medium">{{ r.pts }} b.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <NuxtLink
          v-if="nextMatch"
          to="/liga"
          class="flex min-w-0 flex-[1_1_280px] flex-col justify-between gap-6 rounded-[10px] bg-accent px-[22px] py-5 text-white transition-colors hover:bg-accent-dark"
        >
          <span class="text-[15px]">Další zápas ligy</span>
          <span class="text-[30px] font-light leading-[1.12] tracking-tight2">
            <template v-for="(t, n) in teams" :key="t">
              <br v-if="n">{{ t }}
            </template>
          </span>
          <span class="text-sm text-white/90">{{ nextMatch.round }}. kolo · {{ formatDate(nextMatch.date) }}, {{ nextMatch.time }}, {{ nextMatch.home ? 'doma' : 'venku' }}</span>
        </NuxtLink>

        <NuxtLink
          v-if="lastResult"
          to="/vysledky"
          :class="[box, 'flex min-w-0 flex-[1_1_260px] flex-col justify-between gap-6 transition-colors hover:bg-white']"
        >
          <span class="text-[15px]">Poslední výsledek</span>
          <span class="text-[26px] font-light leading-[1.15] tracking-tight2">
            {{ lastResult.name }}
            <span class="block text-sm tracking-normal text-ink-3">
              {{ lastResult.title }} · vítěz<template v-if="lastResult.pts != null">, {{ lastResult.pts }} bodů</template>
            </span>
          </span>
          <span class="text-sm text-ink-3">{{ formatDate(lastResult.date) }}</span>
        </NuxtLink>
      </div>

      <div class="flex flex-wrap gap-3">
        <div :class="[box, 'flex min-w-0 flex-[2_1_460px] flex-col gap-3.5']">
          <span class="text-[15px]">Novinky</span>
          <div
            v-for="n in news"
            :key="n.stem"
            class="flex gap-[18px] text-[15px] [&:not(:nth-child(2))]:border-t [&:not(:nth-child(2))]:border-line [&:not(:nth-child(2))]:pt-3.5"
          >
            <span class="w-24 flex-none tabular-nums text-ink-3">{{ formatDate(n.date) }}</span>
            <span>{{ n.title }}</span>
          </div>
        </div>

        <div :class="[box, 'flex min-w-0 flex-[1_1_320px] flex-col gap-3.5']">
          <div class="flex items-center justify-between">
            <span class="text-[15px]">Nejbližší akce</span>
            <NuxtLink to="/kalendar" :class="link">Celý kalendář</NuxtLink>
          </div>
          <NuxtLink
            v-for="(t, n) in (upcoming ?? []).slice(0, 3)"
            :key="t.stem"
            :to="`/kalendar/${slugFromStem(t.stem as string)}`"
            class="flex gap-[18px] text-[15px] hover:text-accent"
            :class="{ 'border-t border-line pt-3.5': n > 0 }"
          >
            <span class="w-16 flex-none tabular-nums text-ink-3">{{ formatShortDate(t.date) }}.</span>
            <span>{{ t.title }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- O KLUBU -->
    <section class="mx-auto flex w-full max-w-[1440px] flex-wrap items-start gap-x-16 gap-y-10 px-5 py-28 md:px-20">
      <div class="flex min-w-0 flex-[1_1_480px] flex-col items-start gap-5">
        <p class="text-[22px] text-ink-2">Kdo jsme</p>
        <Headline tag="h2" size="lg" sans="Šipkový klub" serif="z Holešova" />
        <NuxtLink
          to="/o-klubu"
          class="mt-3 inline-flex items-center gap-3 rounded-lg border border-line-strong bg-white py-2 pl-2 pr-[18px] text-[15px] font-medium transition-colors hover:border-ink"
        >
          <span class="flex size-8 items-center justify-center rounded-[5px] bg-accent">
            <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
          Více o klubu
        </NuxtLink>
      </div>
      <div class="flex min-w-0 flex-[1_1_480px] flex-col">
        <p class="mb-7 max-w-[520px] text-lg leading-[1.6] text-ink-2">
          Pořádáme otevřené turnaje a hrajeme 2. ligu ČŠO. Přijď si zahrát, ať jsi začátečník, nebo zkušený hráč.
        </p>
        <div
          v-for="(f, n) in facts"
          :key="f.k"
          class="flex gap-6 border-t border-line-strong py-[18px] text-base"
          :class="{ 'border-b': n === facts.length - 1 }"
        >
          <span class="w-[140px] flex-none text-ink-3">{{ f.k }}</span>
          <span>{{ f.v }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

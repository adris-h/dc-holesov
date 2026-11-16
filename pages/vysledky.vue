<script setup lang="ts">
// Nejnovější celoroční tabulka z turnajů (pole `standings` ve frontmatteru, např. putovni-pohar.md)
const { data: cup } = await useAsyncData('standings-latest', async () => {
  const all = await queryCollection('tournaments').all()
  return all
      .map(t => t.standings)
      .filter(s => s != null)
      .sort((a, b) => b.year - a.year)[0] ?? null
})

// 1–3 = umístění v daném kole, jinak 0
function place(name: string, roundIdx: number): number {
  const podium: string[] = cup.value?.rounds[roundIdx]?.podium ?? []
  return podium.indexOf(name) + 1
}

// Poslední odehrané kolo
const lastIdx = computed(() => {
  if (!cup.value) return -1
  for (let i = cup.value.rounds.length - 1; i >= 0; i--) {
    if (cup.value.rows.some(r => r.scores[i] != null)) return i
  }
  return -1
})
const lastRound = computed(() => {
  const i = lastIdx.value
  if (!cup.value || i < 0) return []
  return cup.value.rows
      .filter(r => r.scores[i] != null)
      .map(r => ({ name: r.name, pts: r.scores[i] as number, place: place(r.name, i) }))
      .sort((a, b) => (a.place || 99) - (b.place || 99) || b.pts - a.pts)
})

// ---- Filtry: poslední turnaj ----
const lastSearch = ref('')
const lastOnlyPodium = ref(false)
const shownLast = computed(() => lastRound.value.filter(r =>
  matchText(r.name, lastSearch.value) && (!lastOnlyPodium.value || r.place > 0),
))
</script>

<template>
  <div>
    <PageHead title="Aktuální Výsledky" lead="Výsledky posledního turnaje a celoroční tabulka Putovního poháru." />

    <AppSection v-if="cup && lastIdx >= 0" :title="`Poslední turnaj – ${formatDate(cup.rounds[lastIdx]?.date)}`">
      <TableFilter
          v-model:search="lastSearch"
          placeholder="Např. Král"
          label="Hledat hráče"
          :shown="shownLast.length"
          :total="lastRound.length"
          unit="hráčů"
          :active="lastOnlyPodium"
          @reset="lastOnlyPodium = false"
      >
        <label class="flex cursor-pointer items-center gap-2 py-2.5 text-[15px] text-ink-2">
          <input v-model="lastOnlyPodium" type="checkbox" class="size-4 accent-accent">
          Jen první tři místa
        </label>
      </TableFilter>
      <AppTable>
        <thead>
          <tr><th>Umístění</th><th>Hráč</th><th class="text-right">Body</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in shownLast" :key="r.name">
            <td :class="r.place === 1 ? 'font-medium text-accent' : 'text-ink-3'">{{ r.place ? `${r.place}.` : '–' }}</td>
            <td :class="r.place ? 'font-medium' : ''">{{ r.name }}</td>
            <td class="text-right">{{ r.pts }}</td>
          </tr>
          <tr v-if="!shownLast.length">
            <td colspan="3" class="!py-10 text-center text-ink-3">Žádný hráč neodpovídá filtrům.</td>
          </tr>
        </tbody>
      </AppTable>
    </AppSection>

    <AppSection v-if="cup" :title="cup.title">
      <StandingsTable :cup="cup" />
    </AppSection>

    <AppSection title="Pavouk">
      <div class="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-line-strong text-ink-3">
        Zde se zobrazí turnajový pavouk
      </div>
    </AppSection>
  </div>
</template>

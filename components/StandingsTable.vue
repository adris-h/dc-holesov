<script setup lang="ts">
import type { TournamentsCollectionItem } from '@nuxt/content'

type Standings = NonNullable<TournamentsCollectionItem['standings']>

const props = defineProps<{ cup: Standings }>()

// Celková tabulka: součet bodů, sdílené pořadí při shodě (1., 2., 2., 4. …)
const standings = computed(() => {
  const rows = props.cup.rows
      .map(r => ({
        ...r,
        total: r.scores.reduce<number>((a, b) => a + (b ?? 0), 0),
        played: r.scores.filter(s => s != null).length,
      }))
      .sort((a, b) => b.total - a.total)
  return rows.map(r => ({ ...r, pos: rows.findIndex(x => x.total === r.total) + 1 }))
})

// 1–3 = umístění v daném kole, jinak 0
function place(name: string, roundIdx: number): number {
  const podium: string[] = props.cup.rounds[roundIdx]?.podium ?? []
  return podium.indexOf(name) + 1
}
function hasPodium(name: string): boolean {
  return props.cup.rounds.some(r => (r.podium ?? []).includes(name))
}
const PLACE_CLASS = ['', 'bg-accent text-white font-medium', 'bg-accent-tint text-accent-dark font-medium', 'bg-bg-2 font-medium']

// ---- Vyhledávání a filtry ----
const search = ref('')
const round = ref<number | 'all'>('all') // index kola nebo všechna
const onlyPodium = ref(false)
const minPlayed = ref(0)

const filtered = computed(() => {
  const ri = round.value
  let rows = standings.value.filter(r =>
    matchText(r.name, search.value)
    && (!onlyPodium.value || (ri === 'all' ? hasPodium(r.name) : place(r.name, ri) > 0))
    && r.played >= minPlayed.value
    && (ri === 'all' || r.scores[ri] != null),
  )
  // Při výběru kola řadit podle výsledku v tom kole
  if (ri !== 'all') {
    rows = [...rows].sort((a, b) =>
      (place(a.name, ri) || 99) - (place(b.name, ri) || 99) || (b.scores[ri] ?? 0) - (a.scores[ri] ?? 0))
  }
  return rows
})

const isFiltered = computed(() => round.value !== 'all' || onlyPodium.value || minPlayed.value > 0)
function reset() {
  search.value = ''
  round.value = 'all'
  onlyPodium.value = false
  minPlayed.value = 0
}
</script>

<template>
  <div>
    <!-- Vyhledávání a filtry -->
    <TableFilter
        v-model:search="search"
        placeholder="Např. Sedlář"
        label="Hledat hráče"
        :shown="filtered.length"
        :total="standings.length"
        unit="hráčů"
        :active="isFiltered"
        @reset="reset"
    >
      <FilterSelect v-model="round" label="Turnaj">
        <option value="all">Všechny turnaje</option>
        <option v-for="(r, i) in cup.rounds" :key="r.date" :value="i">{{ formatDate(r.date) }}</option>
      </FilterSelect>

      <FilterSelect v-model="minPlayed" label="Odehráno turnajů">
        <option :value="0">Kdokoli</option>
        <option v-for="n in cup.rounds.length" :key="n" :value="n">{{ n === cup.rounds.length ? `všech ${n}` : `aspoň ${n}` }}</option>
      </FilterSelect>

      <label class="flex cursor-pointer items-center gap-2 py-2.5 text-[15px] text-ink-2">
        <input v-model="onlyPodium" type="checkbox" class="size-4 accent-accent">
        Jen s umístěním na bedně
      </label>
    </TableFilter>

    <p v-if="round !== 'all'" class="mb-3 text-sm text-ink-3">
      Řazeno podle turnaje {{ formatDate(cup.rounds[round]?.date) }}
    </p>

    <AppTable>
      <thead>
        <tr class="[&_th]:!px-3">
          <th>#</th>
          <th>Hráč</th>
          <th class="text-right">Celkem</th>
          <th
              v-for="(r, i) in cup.rounds"
              :key="r.date"
              class="cursor-pointer text-center transition hover:text-ink"
              :class="round === i ? '!bg-accent-tint !text-accent-dark' : ''"
              :title="`Filtrovat turnaj ${formatDate(r.date)}`"
              @click="round = round === i ? 'all' : i"
          >
            {{ formatShortDate(r.date) }}.
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in filtered" :key="r.name" class="[&_td]:!px-3 [&_td]:!py-3">
          <td :class="r.pos === 1 ? 'font-medium text-accent' : 'text-ink-3'">{{ r.pos }}.</td>
          <td class="whitespace-nowrap" :class="r.pos === 1 ? 'font-medium' : ''">{{ r.name }}</td>
          <td class="text-right font-medium">{{ r.total }}</td>
          <td
              v-for="(s, i) in r.scores"
              :key="i"
              class="text-center"
              :class="round === i ? 'bg-accent-tint/40' : ''"
          >
            <span
                class="inline-flex min-w-8 justify-center rounded-md px-1.5 py-0.5"
                :class="s == null ? 'text-ink-3' : PLACE_CLASS[place(r.name, i)]"
            >{{ s ?? '–' }}</span>
          </td>
        </tr>
        <tr v-if="!filtered.length">
          <td :colspan="3 + cup.rounds.length" class="!py-10 text-center text-ink-3">
            Žádný hráč neodpovídá filtrům.
            <button type="button" class="ml-1 text-accent-dark underline" @click="reset">Zrušit filtry</button>
          </td>
        </tr>
      </tbody>
    </AppTable>

    <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-3">
      <span class="flex items-center gap-2"><span class="size-3 rounded-sm bg-accent" /> 1. místo</span>
      <span class="flex items-center gap-2"><span class="size-3 rounded-sm bg-accent-tint ring-1 ring-accent/30" /> 2. místo</span>
      <span class="flex items-center gap-2"><span class="size-3 rounded-sm bg-bg-2 ring-1 ring-line-strong" /> 3. místo</span>
      <span>Kliknutím na datum v hlavičce zobrazíte jen daný turnaj. Pořadí # je vždy celkové.</span>
    </div>
  </div>
</template>

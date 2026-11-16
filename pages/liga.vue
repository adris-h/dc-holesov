<script setup lang="ts">
// Data: content/league/*.md (nejnovější sezóna)
const { data: league } = await useAsyncData('league', () =>
  queryCollection('league').order('season', 'DESC').first(),
)

const us = computed(() => league.value?.us ?? '')
const captain = computed(() => league.value?.captain ?? '')
const table = computed(() => league.value?.table ?? [])
const matches = computed(() => league.value?.matches ?? [])
const players = computed(() => league.value?.players ?? [])
const info = computed(() => league.value
  ? [
      { k: 'Soutěž', v: `${league.value.title}, sezóna ${league.value.season}` },
      { k: 'Kapitán', v: league.value.captain },
      { k: 'Hrací místo', v: league.value.venue },
    ]
  : [])

// ---- Filtry ----
const tableSearch = ref('')
const shownTable = computed(() => table.value.filter(t => matchText(t.team, tableSearch.value)))

const matchSearch = ref('')
const venue = ref<'all' | 'home' | 'away'>('all')
const state = ref<'all' | 'played' | 'upcoming'>('all')
const shownMatches = computed(() => matches.value.filter(m =>
  matchText([m.opponent, formatDate(m.date), `${m.round}. kolo`], matchSearch.value)
  && (venue.value === 'all' || (venue.value === 'home') === m.home)
  && (state.value === 'all' || (state.value === 'played') === !!m.score),
))
function resetMatches() {
  venue.value = 'all'
  state.value = 'all'
}
</script>

<template>
  <div v-if="league">
    <PageHead :single="true" title="2. liga ČŠO" lead="DC Holešov v 2. lize – Zlínsko." />

    <AppSection>
      <div class="flex flex-col">
        <div
            v-for="(f, n) in info"
            :key="f.k"
            class="flex gap-6 border-t border-line-strong py-[18px] text-base"
            :class="{ 'border-b': n === info.length - 1 }"
        >
          <span class="w-[140px] flex-none text-ink-3">{{ f.k }}</span>
          <span>{{ f.v }}</span>
        </div>
      </div>
    </AppSection>

    <AppSection title="Soupiska">
      <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <AppCard v-for="p in players" :key="p" class="flex items-center justify-between gap-3 !px-5 !py-4">
          <span class="text-[15px]">{{ p }}</span>
          <span v-if="p === captain" class="rounded-full bg-accent-tint px-2.5 py-0.5 text-[13px] text-accent-dark">Kapitán</span>
        </AppCard>
      </div>
    </AppSection>

    <AppSection title="Tabulka">
      <TableFilter
          v-model:search="tableSearch"
          placeholder="Název týmu"
          label="Hledat tým"
          :shown="shownTable.length"
          :total="table.length"
          unit="týmů"
      />
      <AppTable>
        <thead>
        <tr>
          <th>#</th><th>Tým</th>
          <th class="text-right">Z</th><th class="text-right">V</th><th class="text-right">R</th><th class="text-right">P</th>
          <th class="text-right">Zápasy</th><th class="text-right">Legy</th><th class="text-right">Body</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="t in shownTable" :key="t.pos" :class="t.team === us ? 'bg-accent-tint/60' : ''">
          <td :class="t.team === us ? 'font-medium text-accent' : 'text-ink-3'">{{ t.pos }}.</td>
          <td :class="t.team === us ? 'font-medium' : ''">{{ t.team }}</td>
          <td class="text-right">{{ t.z }}</td>
          <td class="text-right">{{ t.v }}</td>
          <td class="text-right">{{ t.r }}</td>
          <td class="text-right">{{ t.p }}</td>
          <td class="text-right text-ink-3">{{ t.matches }}</td>
          <td class="text-right text-ink-3">{{ t.legs }}</td>
          <td class="text-right font-medium">{{ t.pts }}</td>
        </tr>
        <tr v-if="!shownTable.length">
          <td colspan="9" class="!py-10 text-center text-ink-3">Žádný tým neodpovídá hledání.</td>
        </tr>
        </tbody>
      </AppTable>
      <p class="mt-3 text-sm text-ink-3">
        Z = zápasy, V = výhry, R = remízy, P = prohry. Stav k {{ formatDate(league.updated) }}. Zdroj:
        <a :href="league.tableUrl" target="_blank" rel="noopener" class="text-accent-dark underline">liga.czechdarts.org</a>.
      </p>
    </AppSection>

    <AppSection title="Rozpis zápasů">
      <TableFilter
          v-model:search="matchSearch"
          placeholder="Soupeř, datum nebo kolo"
          label="Hledat zápas"
          :shown="shownMatches.length"
          :total="matches.length"
          unit="zápasů"
          :active="venue !== 'all' || state !== 'all'"
          @reset="resetMatches"
      >
        <FilterSelect v-model="venue" label="Místo">
          <option value="all">Doma i venku</option>
          <option value="home">Doma</option>
          <option value="away">Venku</option>
        </FilterSelect>
        <FilterSelect v-model="state" label="Stav">
          <option value="all">Všechny zápasy</option>
          <option value="played">Odehrané</option>
          <option value="upcoming">Nadcházející</option>
        </FilterSelect>
      </TableFilter>
      <AppTable>
        <thead>
        <tr>
          <th>Kolo</th><th>Datum</th><th>Čas</th><th>Soupeř</th><th>Místo</th><th class="text-right">Výsledek</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="m in shownMatches" :key="m.date + m.time">
          <td class="text-ink-3">{{ m.round }}.</td>
          <td class="whitespace-nowrap">{{ formatDate(m.date) }}</td>
          <td class="text-ink-3">{{ m.time }}</td>
          <td class="font-medium">{{ m.opponent }}</td>
          <td>{{ m.home ? 'Doma' : 'Venku' }}</td>
          <td class="text-right" :class="m.score ? 'font-medium' : 'text-ink-3'">
            <a v-if="m.url" :href="m.url" target="_blank" rel="noopener" class="text-accent-dark underline">{{ m.score }}</a>
            <template v-else>{{ m.score ?? '–' }}</template>
          </td>
        </tr>
        <tr v-if="!shownMatches.length">
          <td colspan="6" class="!py-10 text-center text-ink-3">Žádný zápas neodpovídá filtrům.</td>
        </tr>
        </tbody>
      </AppTable>
      <p class="mt-3 text-sm text-ink-3">
        Skóre je z pohledu {{ league.us }}. Podrobné výsledky jsou na
        <a :href="league.teamUrl" target="_blank" rel="noopener" class="text-accent-dark underline">stránce týmu</a>.
      </p>
    </AppSection>
  </div>
</template>
<script setup lang="ts">
const results = [
  { pos: 1, name: 'Jméno Příjmení', club: 'DC Holešov', pts: 42 },
  { pos: 2, name: 'Jméno Příjmení', club: 'DC Zlín', pts: 38 },
  { pos: 3, name: 'Jméno Příjmení', club: 'DC Kroměříž', pts: 35 },
  { pos: 4, name: 'Jméno Příjmení', club: 'DC Holešov', pts: 31 },
  { pos: 5, name: 'Jméno Příjmení', club: 'DC Přerov', pts: 27 },
]
const oom = [
  { pos: 1, name: 'Jméno Příjmení', pts: 210 },
  { pos: 2, name: 'Jméno Příjmení', pts: 185 },
  { pos: 3, name: 'Jméno Příjmení', pts: 170 },
]
</script>

<template>
  <div>
    <PageHead title="Aktuální Výsledky" lead="Výsledky posledního turnaje a klubový žebříček." />

    <AppSection title="Vánoční turnaj – 14. 12. 2026">
      <AppTable>
        <thead>
          <tr><th>#</th><th>Hráč</th><th>Klub</th><th class="text-right">Body</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in results" :key="r.pos">
            <td :class="r.pos === 1 ? 'font-medium text-accent' : ''">{{ r.pos }}.</td>
            <td :class="r.pos === 1 ? 'font-medium' : ''">{{ r.name }}</td>
            <td class="text-ink-3">{{ r.club }}</td>
            <td class="text-right">{{ r.pts }}</td>
          </tr>
        </tbody>
      </AppTable>
    </AppSection>

    <AppSection title="Pavouk">
      <div class="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-line-strong text-ink-3">
        Zde se zobrazí turnajový pavouk
      </div>
    </AppSection>

    <AppSection title="Klubový žebříček">
      <AppTable>
        <thead>
          <tr><th>#</th><th>Hráč</th><th class="text-right">Body</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in oom" :key="r.pos">
            <td :class="r.pos === 1 ? 'font-medium text-accent' : ''">{{ r.pos }}.</td>
            <td :class="r.pos === 1 ? 'font-medium' : ''">{{ r.name }}</td>
            <td class="text-right">{{ r.pts }}</td>
          </tr>
        </tbody>
      </AppTable>
    </AppSection>
  </div>
</template>

<script setup lang="ts">
const players = [
  { name: 'Jméno Příjmení', nick: 'Přezdívka', gear: 'Target 22 g' },
  { name: 'Jméno Příjmení', nick: 'Přezdívka', gear: 'Winmau 23 g' },
  { name: 'Jméno Příjmení', nick: 'Přezdívka', gear: 'Harrows 21 g' },
  { name: 'Jméno Příjmení', nick: 'Přezdívka', gear: 'Unicorn 24 g' },
]
const initials = (n: string) => n.split(' ').map((p) => p[0]).join('')
const table = [
  { pos: 1, team: 'DC Holešov A', played: 6, pts: 15 },
  { pos: 2, team: 'DC Zlín B', played: 6, pts: 13 },
  { pos: 3, team: 'DC Kroměříž', played: 6, pts: 10 },
]
const matches = [
  { date: '17. 1. 2027', home: 'DC Holešov A', away: 'DC Zlín B', score: '–' },
  { date: '6. 12. 2026', home: 'DC Holešov A', away: 'DC Přerov', score: '10:6' },
  { date: '22. 11. 2026', home: 'DC Vsetín', away: 'DC Holešov A', score: '7:9' },
]
</script>

<template>
  <div>
    <PageHead :single="true" title="2. liga ČŠO" lead="A-tým DC Holešov v 2. Zlínské lize." />

    <AppSection title="Soupiska">
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <AppCard v-for="p in players" :key="p.name" class="flex items-center gap-4">
          <div class="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-tint font-medium text-accent-dark">
            {{ initials(p.name) }}
          </div>
          <div>
            <h3 class="font-medium tracking-tight">{{ p.name }}</h3>
            <p class="text-[15px] text-ink-3">„{{ p.nick }}“ </p>
            <p class="text-[15px] text-ink-3">{{ p.gear }}</p>
          </div>
        </AppCard>
      </div>
    </AppSection>

    <AppSection title="Tabulka">
      <AppTable>
        <thead>
          <tr><th>#</th><th>Tým</th><th class="text-right">Zápasy</th><th class="text-right">Body</th></tr>
        </thead>
        <tbody>
          <tr v-for="t in table" :key="t.pos">
            <td>{{ t.pos }}.</td>
            <td :class="t.pos === 1 ? 'font-medium' : ''">{{ t.team }}</td>
            <td class="text-right">{{ t.played }}</td>
            <td class="text-right font-medium">{{ t.pts }}</td>
          </tr>
        </tbody>
      </AppTable>
      <p class="mt-3 text-sm text-ink-3">Zde bude odkaz nebo widget z webu ČŠO.</p>
    </AppSection>

    <AppSection title="Rozpis zápasů">
      <AppTable>
        <thead>
          <tr><th>Datum</th><th>Domácí</th><th>Hosté</th><th class="text-right">Výsledek</th></tr>
        </thead>
        <tbody>
          <tr v-for="m in matches" :key="m.date">
            <td>{{ m.date }}</td><td>{{ m.home }}</td><td>{{ m.away }}</td><td class="text-right">{{ m.score }}</td>
          </tr>
        </tbody>
      </AppTable>
    </AppSection>
  </div>
</template>

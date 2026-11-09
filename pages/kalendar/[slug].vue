<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: t } = await useAsyncData(`tournament-${slug}`, () =>
  queryCollection('tournaments').where('stem', '=', `tournaments/${slug}`).first(),
)

if (!t.value) {
  throw createError({ statusCode: 404, statusMessage: 'Turnaj nenalezen', fatal: true })
}

// prototyp: seznam přihlášených je zatím statický
const players = [
  { n: 1, name: 'Petr Novák', club: 'DC Holešov' },
  { n: 2, name: 'Jan Svoboda', club: 'DC Zlín' },
  { n: 3, name: 'Martin Dvořák', club: 'DC Kroměříž' },
  { n: 4, name: 'Tomáš Černý', club: 'DC Holešov' },
]
</script>

<template>
  <div v-if="t">
    <PageHead :title="t.title" :lead="t.lead" />

    <AppSection>
      <div class="grid max-w-3xl gap-3 sm:grid-cols-3">
        <InfoCard label="Kdy" :value="formatDate(t.date)" :sub="`ve ${t.time}`" />
        <InfoCard label="Kde" :value="t.place" :sub="t.placeSub" />
        <InfoCard v-if="t.fee" label="Startovné" :value="String(t.fee)" sub="Kč" />
      </div>
    </AppSection>

    <AppSection title="Propozice">
      <Prose>
        <ContentRenderer :value="t" />
      </Prose>
    </AppSection>

    <AppSection v-if="t.status === 'open'" id="prihlaska" title="Přihláška">
      <div class="grid gap-6 md:grid-cols-2">
        <AppCard>
          <form class="flex flex-col gap-5" @submit.prevent>
            <FormField label="Jméno a příjmení" placeholder="Jan Novák" />
            <FormField label="Přezdívka (volitelné)" />
            <FormField label="Klub / Město" />
            <FormField label="E-mail nebo telefon" />
            <AppButton type="submit" variant="primary" size="lg">Odeslat přihlášku</AppButton>
          </form>
        </AppCard>

        <AppCard>
          <h3 class="text-lg font-medium tracking-tight2">
            Přihlášeno {{ t.registered ?? 0 }} z {{ t.capacity }} hráčů
          </h3>
          <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-2">
            <div
              class="h-full rounded-full bg-accent"
              :style="{ width: `${Math.min(100, ((t.registered ?? 0) / (t.capacity || 1)) * 100)}%` }"
            />
          </div>
          <table
            class="mt-4 w-full text-left [&_td]:px-1 [&_td]:py-3 [&_tr+tr_td]:border-t [&_tr+tr_td]:border-line"
          >
            <tbody>
              <tr v-for="p in players" :key="p.n">
                <td class="w-10 tabular-nums text-ink-3">{{ p.n }}.</td>
                <td>{{ p.name }}</td>
                <td class="text-right text-ink-3">{{ p.club }}</td>
              </tr>
            </tbody>
          </table>
        </AppCard>
      </div>
    </AppSection>
  </div>
</template>

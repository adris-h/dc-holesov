<script setup lang="ts">
const { data: tournaments } = await useAsyncData('tournaments', () =>
  queryCollection('tournaments').order('date', 'ASC').all(),
)

// filtr podle měsíce (z dat)
const MONTHS = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec']
const monthOf = (iso: string) => Number(iso.split('-')[1]) - 1
const months = computed(() => [...new Set((tournaments.value ?? []).map((t) => monthOf(t.date)))])
const active = ref<number | null>(null)
const shown = computed(() =>
  (tournaments.value ?? []).filter((t) => active.value === null || monthOf(t.date) === active.value),
)

const next = computed(() => (tournaments.value ?? []).find((t) => t.status === 'open'))
const pill = 'rounded-lg border px-[18px] py-2.5 text-[15px] transition-colors'
</script>

<template>
  <div>
    <PageHead
      title="Kalendář"
      serif="turnajů"
      :badge="next?.deadline ? `Registrace otevřena do ${formatShortDate(next.deadline)}` : undefined"
    />

    <AppSection>
      <div class="flex flex-wrap items-start gap-10">
        <div class="flex min-w-0 flex-[1_1_620px] flex-col gap-5">
          <div class="flex flex-wrap gap-2">
            <button
              :class="[pill, active === null ? 'border-ink bg-ink text-white' : 'border-line bg-surface hover:border-ink']"
              @click="active = null"
            >
              Vše
            </button>
            <button
              v-for="m in months"
              :key="m"
              :class="[pill, active === m ? 'border-ink bg-ink text-white' : 'border-line bg-surface hover:border-ink']"
              @click="active = m"
            >
              {{ MONTHS[m] }}
            </button>
          </div>

          <div class="flex flex-col gap-3">
            <TournamentRow
              v-for="t in shown"
              :key="t.stem"
              v-bind="t"
              :slug="slugFromStem(t.stem as string)"
              :highlight="next?.stem === t.stem"
            />
          </div>
        </div>

        <!-- tmavá karta: nejbližší turnaj -->
        <aside
          v-if="next"
          class="relative flex min-w-0 flex-[0_1_380px] flex-col gap-6 overflow-hidden rounded-2xl bg-night p-7 text-white"
        >
          <div class="absolute -right-[120px] -top-[120px] size-80 rounded-full border border-white/10" />
          <div class="absolute -right-[70px] -top-[70px] size-[220px] rounded-full border border-white/10" />
          <div class="absolute right-0 top-0 size-[90px] -translate-y-[40%] translate-x-[40%] rounded-full bg-accent" />

          <div class="relative text-[15px]">Nejbližší turnaj</div>
          <div class="relative text-[40px] font-light leading-[1.05] tracking-[-0.03em]">{{ next.title }}</div>
          <dl class="relative flex flex-col text-[15px]">
            <div class="flex justify-between border-t border-white/15 py-3">
              <dt class="text-white/70">Kdy</dt><dd>{{ formatDate(next.date) }}, {{ next.time }}</dd>
            </div>
            <div class="flex justify-between border-t border-white/15 py-3">
              <dt class="text-white/70">Kde</dt><dd>{{ next.place }} {{ next.placeSub }}</dd>
            </div>
            <div v-if="next.capacity" class="flex justify-between border-t border-white/15 py-3">
              <dt class="text-white/70">Přihlášeno</dt><dd>{{ next.registered ?? 0 }} z {{ next.capacity }}</dd>
            </div>
          </dl>
          <div v-if="next.capacity" class="relative h-1 rounded-sm bg-white/15">
            <div
              class="h-full rounded-sm bg-accent-bright"
              :style="{ width: `${Math.min(100, ((next.registered ?? 0) / next.capacity) * 100)}%` }"
            />
          </div>
          <AppButton :to="`/kalendar/${slugFromStem(next.stem as string)}#prihlaska`" variant="primary" size="lg" class="relative">
            Chci se zúčastnit
          </AppButton>
        </aside>
      </div>
    </AppSection>
  </div>
</template>

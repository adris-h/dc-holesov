<script setup lang="ts">
import type { Registration, RegistrationStatus } from '~/composables/useRegistrations'

useHead({ title: 'Administrace – DC Holešov', meta: [{ name: 'robots', content: 'noindex' }] })

const { user, isAdmin, ready, logout } = useAuth()

// Turnaje z obsahu (názvy, kapacity)
const { data: tournaments } = await useAsyncData('admin-tournaments', () =>
  queryCollection('tournaments').order('date', 'DESC').all(),
)
const tournamentBySlug = computed(() =>
  Object.fromEntries((tournaments.value ?? []).map(t => [slugFromStem(t.stem as string), t])),
)

// Data z Firestore – odběr běží jen pro admina
const { list: registrations, loading, error: loadError } = useAllRegistrations(() => isAdmin.value)
const { contacts } = useRegistrationContacts(() => isAdmin.value)
const { setStatus, remove } = useRegistrationActions()

// ---- Filtry ----
const STATUS_TABS: { key: RegistrationStatus | 'all'; label: string }[] = [
  { key: 'pending', label: 'Čekající' },
  { key: 'accepted', label: 'Přijaté' },
  { key: 'rejected', label: 'Odmítnuté' },
  { key: 'all', label: 'Vše' },
]
const STATUS_LABEL_REG: Record<RegistrationStatus, string> = { pending: 'Čeká', accepted: 'Přijato', rejected: 'Odmítnuto' }
const STATUS_CLASS: Record<RegistrationStatus, string> = {
  pending: 'bg-[#FFF4D6] text-[#8A5A00]',
  accepted: 'bg-accent-tint text-accent-dark',
  rejected: 'bg-bg-2 text-ink-3',
}

const tournament = ref('all')
const status = ref<RegistrationStatus | 'all'>('pending')
const search = ref('')

const inTournament = computed(() =>
  registrations.value.filter(r => tournament.value === 'all' || r.tournament === tournament.value),
)
const countBy = (s: RegistrationStatus | 'all') =>
  s === 'all' ? inTournament.value.length : inTournament.value.filter(r => r.status === s).length
const shown = computed(() =>
  inTournament.value.filter(r =>
    (status.value === 'all' || r.status === status.value)
    && matchText([r.name, r.nickname, r.club, contacts.value[r.id]], search.value),
  ),
)

// Turnaje v nabídce: ty, které mají kapacitu nebo nějakou přihlášku
const tournamentOptions = computed(() => {
  const withRegs = new Set(registrations.value.map(r => r.tournament))
  return (tournaments.value ?? [])
    .map(t => ({ slug: slugFromStem(t.stem as string), title: t.title, date: t.date }))
    .filter(t => withRegs.has(t.slug) || tournamentBySlug.value[t.slug]?.status === 'open')
})
const pendingFor = (slug: string) => registrations.value.filter(r => r.tournament === slug && r.status === 'pending').length

// Kapacita
const acceptedFor = (slug: string) => registrations.value.filter(r => r.tournament === slug && r.status === 'accepted').length
const capacityFor = (slug: string) => tournamentBySlug.value[slug]?.capacity
const isFull = (slug: string) => {
  const cap = capacityFor(slug)
  return !!cap && acceptedFor(slug) >= cap
}

// ---- Akce ----
const busy = ref<string | null>(null)
const confirmDelete = ref<string | null>(null)
const actionError = ref('')

async function run(id: string, fn: () => Promise<void>) {
  busy.value = id
  actionError.value = ''
  try {
    await fn()
  }
  catch (e) {
    actionError.value = firebaseErrorMessage(e)
  }
  finally {
    busy.value = null
  }
}
const accept = (r: Registration) => run(r.id, () => setStatus(r.id, 'accepted'))
const reject = (r: Registration) => run(r.id, () => setStatus(r.id, 'rejected'))
const reopen = (r: Registration) => run(r.id, () => setStatus(r.id, 'pending'))
async function del(r: Registration) {
  if (confirmDelete.value !== r.id) {
    confirmDelete.value = r.id
    return
  }
  confirmDelete.value = null
  await run(r.id, () => remove(r.id))
}

function resetFilters() {
  tournament.value = 'all'
  status.value = 'pending'
}

const btn = 'rounded-md px-3 py-1.5 text-[13.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'
</script>

<template>
  <div class="mt-16">
    <PageHead :single="true" title="Administrace" lead="Schvalování přihlášek na turnaje." />

    <AppSection>
      <!-- Stav přihlášení -->
      <AppCard v-if="!ready" class="max-w-[480px]"><p class="text-ink-3">Načítám…</p></AppCard>

      <AppCard v-else-if="!user" class="flex max-w-[480px] flex-col items-start gap-4">
        <p class="text-ink-2">Pro správu přihlášek se přihlaste účtem pořadatele.</p>
        <AppButton to="/prihlasit?redirect=/admin" variant="primary" size="lg" arrow>
          Přihlásit se
        </AppButton>
      </AppCard>

      <AppCard v-else-if="!isAdmin" class="flex max-w-[480px] flex-col items-start gap-4">
        <p class="text-ink-2">
          Účet <strong class="font-medium text-ink">{{ user.email }}</strong> nemá oprávnění pořadatele.
        </p>
        <AppButton size="lg" @click="logout">Odhlásit se</AppButton>
      </AppCard>

      <!-- Administrace -->
      <div v-else class="flex flex-col gap-6">
        <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-3">
          <span>Přihlášen jako <strong class="font-medium text-ink">{{ user.email }}</strong></span>
          <span class="flex items-center gap-4">
            <NuxtLink to="/ucet" class="text-accent-dark underline">Můj účet</NuxtLink>
            <button type="button" class="text-accent-dark underline" @click="logout">Odhlásit se</button>
          </span>
        </div>

        <!-- Přehled po turnajích -->
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="t in tournamentOptions"
            :key="t.slug"
            type="button"
            class="flex flex-col gap-1 rounded-[10px] border bg-surface px-5 py-4 text-left transition-colors hover:bg-white"
            :class="tournament === t.slug ? 'border-accent' : 'border-line'"
            @click="tournament = tournament === t.slug ? 'all' : t.slug"
          >
            <span class="text-sm text-ink-3">{{ formatDate(t.date) }}</span>
            <span class="text-lg font-medium tracking-[-0.01em]">{{ t.title }}</span>
            <span class="flex flex-wrap gap-x-4 text-sm">
              <span :class="pendingFor(t.slug) ? 'font-medium text-[#8A5A00]' : 'text-ink-3'">
                {{ pendingFor(t.slug) }} čeká
              </span>
              <span :class="isFull(t.slug) ? 'font-medium text-accent-dark' : 'text-ink-3'">
                přijato {{ acceptedFor(t.slug) }}<template v-if="capacityFor(t.slug)"> / {{ capacityFor(t.slug) }}</template>
              </span>
            </span>
          </button>
        </div>

        <!-- Záložky stavu -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="s in STATUS_TABS"
            :key="s.key"
            type="button"
            class="rounded-lg border px-[18px] py-2.5 text-[15px] transition-colors"
            :class="status === s.key ? 'border-ink bg-ink text-white' : 'border-line bg-surface hover:border-ink'"
            @click="status = s.key"
          >
            {{ s.label }}
            <span class="ml-1 tabular-nums opacity-70">{{ countBy(s.key) }}</span>
          </button>
        </div>

        <div>
          <TableFilter
            v-model:search="search"
            placeholder="Jméno, klub nebo kontakt"
            label="Hledat přihlášku"
            :shown="shown.length"
            :total="inTournament.length"
            unit="přihlášek"
            :active="tournament !== 'all' || status !== 'pending'"
            @reset="resetFilters"
          >
            <FilterSelect v-model="tournament" label="Turnaj">
              <option value="all">Všechny turnaje</option>
              <option v-for="t in tournamentOptions" :key="t.slug" :value="t.slug">
                {{ t.title }} ({{ formatDate(t.date) }})
              </option>
            </FilterSelect>
          </TableFilter>

          <p v-if="loadError" class="mb-4 rounded-lg bg-accent-tint px-4 py-3 text-sm text-accent-dark" role="alert">{{ loadError }}</p>
          <p v-if="actionError" class="mb-4 rounded-lg bg-accent-tint px-4 py-3 text-sm text-accent-dark" role="alert">{{ actionError }}</p>

          <AppTable>
            <thead>
              <tr class="[&_th]:!px-4">
                <th>Odesláno</th>
                <th>Hráč</th>
                <th>Klub</th>
                <th>Kontakt</th>
                <th v-if="tournament === 'all'">Turnaj</th>
                <th>Stav</th>
                <th class="text-right">Akce</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="!py-10 text-center text-ink-3">Načítám přihlášky…</td>
              </tr>
              <template v-else>
                <tr v-for="r in shown" :key="r.id" class="[&_td]:!px-4 [&_td]:align-middle" :class="{ 'opacity-60': busy === r.id }">
                  <td class="whitespace-nowrap text-sm text-ink-3">{{ formatDateTime(r.createdAt) }}</td>
                  <td>
                    <span class="font-medium">{{ r.name }}</span>
                    <span
                      v-if="r.uid"
                      class="ml-1.5 rounded-full bg-bg-2 px-2 py-0.5 align-middle text-[11.5px] text-ink-3"
                      title="Přihláška odeslaná z uživatelského účtu"
                    >účet</span>
                    <span v-if="r.nickname" class="block text-sm text-ink-3">„{{ r.nickname }}“</span>
                  </td>
                  <td class="text-ink-2">{{ r.club ?? '–' }}</td>
                  <td>
                    <a v-if="contacts[r.id]" :href="contactHref(contacts[r.id]!)" class="break-all text-accent-dark underline">{{ contacts[r.id] }}</a>
                    <span v-else class="text-ink-3">–</span>
                  </td>
                  <td v-if="tournament === 'all'" class="text-sm">
                    {{ tournamentBySlug[r.tournament]?.title ?? r.tournament }}
                    <span v-if="tournamentBySlug[r.tournament]" class="block text-ink-3">{{ formatDate(tournamentBySlug[r.tournament]!.date) }}</span>
                  </td>
                  <td>
                    <span class="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px]" :class="STATUS_CLASS[r.status]">
                      {{ STATUS_LABEL_REG[r.status] }}
                    </span>
                  </td>
                  <td>
                    <div class="flex flex-wrap justify-end gap-1.5">
                      <button
                        v-if="r.status !== 'accepted'"
                        type="button"
                        :class="[btn, 'bg-accent text-white hover:bg-accent-dark']"
                        :disabled="busy === r.id || isFull(r.tournament)"
                        :title="isFull(r.tournament) ? 'Kapacita turnaje je naplněna' : undefined"
                        @click="accept(r)"
                      >
                        Přijmout
                      </button>
                      <button
                        v-if="r.status !== 'rejected'"
                        type="button"
                        :class="[btn, 'border border-line-strong bg-white hover:border-ink']"
                        :disabled="busy === r.id"
                        @click="reject(r)"
                      >
                        Odmítnout
                      </button>
                      <button
                        v-if="r.status !== 'pending'"
                        type="button"
                        :class="[btn, 'border border-line-strong bg-white hover:border-ink']"
                        :disabled="busy === r.id"
                        @click="reopen(r)"
                      >
                        Vrátit
                      </button>
                      <button
                        type="button"
                        :class="[btn, confirmDelete === r.id ? 'bg-ink text-white' : 'text-ink-3 hover:text-accent-dark']"
                        :disabled="busy === r.id"
                        @click="del(r)"
                        @blur="confirmDelete = confirmDelete === r.id ? null : confirmDelete"
                      >
                        {{ confirmDelete === r.id ? 'Opravdu smazat?' : 'Smazat' }}
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!shown.length">
                  <td colspan="7" class="!py-10 text-center text-ink-3">
                    {{ status === 'pending' && !search ? 'Žádné přihlášky nečekají na schválení.' : 'Žádná přihláška neodpovídá filtrům.' }}
                  </td>
                </tr>
              </template>
            </tbody>
          </AppTable>
          <p class="mt-3 text-sm text-ink-3">
            Přijatí hráči se hned zobrazí na stránce turnaje. Kontakty vidí jen pořadatelé.
          </p>
        </div>
      </div>
    </AppSection>
  </div>
</template>

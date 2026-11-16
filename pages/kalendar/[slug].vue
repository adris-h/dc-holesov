<script setup lang="ts">
import type { RegistrationForm } from '~/composables/useRegistrations'

const route = useRoute()
const slug = route.params.slug as string

const { data: t } = await useAsyncData(`tournament-${slug}`, () =>
  queryCollection('tournaments').where('stem', '=', `tournaments/${slug}`).first(),
)

if (!t.value) {
  throw createError({ statusCode: 404, statusMessage: 'Turnaj nenalezen', fatal: true })
}

// Celoroční tabulka turnaje (pole `standings` ve frontmatteru)
const cup = computed(() => t.value?.standings)

// ---- Přihlášení hráči (Firestore, jen schválené) ----
const { list: players, loading: playersLoading, error: playersError } = useAcceptedRegistrations(slug)
const registered = computed(() => players.value.length)
const registeredLabel = computed(() => (playersLoading.value ? '–' : String(registered.value)))
const isFull = computed(() => !!t.value?.capacity && registered.value >= t.value.capacity)

const today = new Date().toISOString().slice(0, 10)
const deadlinePassed = computed(() => !!t.value?.deadline && today > t.value.deadline)
const tournamentPast = computed(() => !!t.value && today > t.value.date)
const closedReason = computed(() => {
  if (tournamentPast.value) return 'Turnaj už proběhl.'
  if (deadlinePassed.value) return `Uzávěrka přihlášek byla ${formatDate(t.value?.deadline)}.`
  if (isFull.value) return 'Kapacita turnaje je naplněna.'
  return null
})

// ---- Účet: předvyplnění a stav vlastní přihlášky ----
const { user } = useAuth()
const { profile } = useProfile()
const { list: myRegs } = useMyRegistrations()
const myReg = computed(() => myRegs.value.find(r => r.tournament === slug && r.status !== 'rejected'))
const MY_STATUS: Record<string, string> = { pending: 'čeká na schválení', accepted: 'schváleno' }
const loginLink = `/prihlasit?redirect=${encodeURIComponent(`/kalendar/${slug}`)}`

// ---- Formulář přihlášky ----
const { submit } = useRegistrationActions()
const form = reactive<RegistrationForm>({ name: '', nickname: '', club: '', contact: '' })

/** Vyplní prázdná pole z účtu (jméno, přezdívka, klub, e-mail). */
function prefill() {
  if (!user.value) return
  form.name ||= profile.value?.name || user.value.name || ''
  form.nickname ||= profile.value?.nickname ?? ''
  form.club ||= profile.value?.club ?? ''
  form.contact ||= user.value.email ?? ''
}
watch([user, profile], prefill, { immediate: true })
const state = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const errorMsg = ref('')
const consent = ref(false)

const canSubmit = computed(() =>
  form.name.trim().length >= 3 && form.contact.trim().length >= 5 && consent.value && state.value !== 'sending' && !closedReason.value,
)

async function onSubmit() {
  if (!canSubmit.value) return
  state.value = 'sending'
  errorMsg.value = ''
  try {
    await submit(slug, form)
    state.value = 'sent'
    Object.assign(form, { name: '', nickname: '', club: '', contact: '' })
    consent.value = false
    prefill()
  }
  catch (e) {
    state.value = 'error'
    errorMsg.value = firebaseErrorMessage(e)
  }
}

// ---- Filtr přihlášených ----
const playerSearch = ref('')
const club = ref('all')
const clubs = computed(() => [...new Set(players.value.map(p => p.club).filter(Boolean) as string[])].sort())
const shownPlayers = computed(() => players.value.filter(p =>
  matchText([p.name, p.nickname, p.club], playerSearch.value) && (club.value === 'all' || p.club === club.value),
))
</script>

<template>
  <div v-if="t">
    <PageHead :title="t.title" :lead="t.lead" />

    <AppSection>
      <div class="grid max-w-3xl gap-3 sm:grid-cols-2 md:grid-cols-4">
        <InfoCard label="Kdy" :value="formatDate(t.date)" :sub="`ve ${t.time}`" />
        <InfoCard label="Kde" :value="t.place" :sub="t.placeSub" />
        <InfoCard v-if="t.fee" label="Startovné" :value="String(t.fee)" sub="Kč" />
        <InfoCard v-if="t.advances" label="Postupuje" :value="String(t.advances)" sub="hráčů" />
        <InfoCard v-if="t.checkin" label="Prezentace" :value="t.checkin" />
        <InfoCard v-if="t.deadline" label="Přihlášky do" :value="formatDate(t.deadline)" />
        <InfoCard v-if="t.capacity" label="Kapacita" :value="`${registeredLabel} / ${t.capacity}`" sub="přihlášeno" />
        <InfoCard label="Stav" :value="STATUS_LABEL[t.status] ?? t.status" />
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
          <!-- Odesláno -->
          <div v-if="state === 'sent'" class="flex flex-col items-start gap-4" role="status">
            <span class="flex size-11 items-center justify-center rounded-full bg-accent-tint text-accent-dark">
              <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
            </span>
            <h3 class="text-xl font-medium tracking-tight2">Přihláška odeslána</h3>
            <p class="text-ink-2">
              Děkujeme! Pořadatel ji co nejdříve zkontroluje. Po schválení se objevíte v seznamu přihlášených.
              <template v-if="user"> Stav přihlášky uvidíte v <NuxtLink to="/ucet" class="text-accent-dark underline">Můj účet</NuxtLink>.</template>
            </p>
            <AppButton @click="state = 'idle'">Přihlásit dalšího hráče</AppButton>
          </div>

          <!-- Uzavřeno -->
          <div v-else-if="closedReason" class="flex flex-col gap-2">
            <h3 class="text-xl font-medium tracking-tight2">Přihlašování je uzavřené</h3>
            <p class="text-ink-2">{{ closedReason }}</p>
          </div>

          <!-- Formulář -->
          <form v-else class="flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
            <p v-if="myReg" class="rounded-lg bg-accent-tint px-4 py-3 text-sm text-accent-dark">
              Na tento turnaj už jste přihlášen(a) – {{ MY_STATUS[myReg.status] }}.
              <NuxtLink to="/ucet" class="underline">Moje přihlášky</NuxtLink>.
              Formulářem můžete přihlásit dalšího hráče.
            </p>
            <p v-else-if="user" class="text-sm text-ink-3">
              Přihlašujete se jako <strong class="font-medium text-ink">{{ user.email }}</strong>. Údaje jsme předvyplnili z účtu.
            </p>
            <p v-else class="text-sm text-ink-3">
              Máte účet? <NuxtLink :to="loginLink" class="text-accent-dark underline">Přihlaste se</NuxtLink>
              – formulář se vyplní sám a uvidíte stav přihlášky. Nebo
              <NuxtLink to="/registrace" class="text-accent-dark underline">si účet založte</NuxtLink>.
              Přihlásit se na turnaj jde i bez účtu.
            </p>
            <FormField
              v-model="form.name"
              label="Jméno a příjmení"
              placeholder="Jan Novák"
              autocomplete="name"
              :maxlength="REG_LIMITS.name"
              required
            />
            <FormField v-model="form.nickname" label="Přezdívka (volitelné)" :maxlength="REG_LIMITS.nickname" />
            <FormField v-model="form.club" label="Klub / Město" :maxlength="REG_LIMITS.club" />
            <FormField
              v-model="form.contact"
              label="E-mail nebo telefon"
              autocomplete="email"
              :maxlength="REG_LIMITS.contact"
              hint="Uvidí ho jen pořadatel."
              required
            />
            <label class="flex cursor-pointer items-start gap-2.5 text-sm text-ink-2">
              <input v-model="consent" type="checkbox" class="mt-0.5 size-4 flex-none accent-accent">
              Souhlasím, že jméno, přezdívka a klub budou po schválení zveřejněny v seznamu přihlášených.
            </label>
            <p v-if="state === 'error'" class="rounded-lg bg-accent-tint px-4 py-3 text-sm text-accent-dark" role="alert">
              {{ errorMsg }}
            </p>
            <AppButton type="submit" variant="primary" size="lg" :disabled="!canSubmit" class="disabled:cursor-not-allowed disabled:opacity-50">
              {{ state === 'sending' ? 'Odesílám…' : 'Odeslat přihlášku' }}
            </AppButton>
            <p class="text-[13px] text-ink-3">Přihláška se zobrazí v seznamu až po schválení pořadatelem.</p>
          </form>
        </AppCard>

        <AppCard>
          <h3 class="text-lg font-medium tracking-tight2">
            Přihlášeno {{ registeredLabel }}<template v-if="t.capacity"> z {{ t.capacity }}</template> hráčů
          </h3>
          <div v-if="t.capacity" class="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-2">
            <div
              class="h-full rounded-full bg-accent transition-[width]"
              :style="{ width: `${Math.min(100, (registered / t.capacity) * 100)}%` }"
            />
          </div>

          <p v-if="playersError" class="mt-5 text-sm text-accent-dark">{{ playersError }}</p>
          <p v-else-if="playersLoading" class="mt-5 text-sm text-ink-3">Načítám seznam…</p>
          <p v-else-if="!players.length" class="mt-5 text-ink-3">Zatím nikdo. Buďte první!</p>

          <template v-else>
            <div class="mt-5">
              <TableFilter
                v-model:search="playerSearch"
                placeholder="Jméno, přezdívka nebo klub"
                label="Hledat přihlášené"
                :shown="shownPlayers.length"
                :total="players.length"
                unit="hráčů"
                :active="club !== 'all'"
                @reset="club = 'all'"
              >
                <FilterSelect v-if="clubs.length > 1" v-model="club" label="Klub">
                  <option value="all">Všechny kluby</option>
                  <option v-for="c in clubs" :key="c" :value="c">{{ c }}</option>
                </FilterSelect>
              </TableFilter>
            </div>
            <table class="w-full text-left [&_td]:px-1 [&_td]:py-3 [&_tr+tr_td]:border-t [&_tr+tr_td]:border-line">
              <tbody>
                <tr v-for="p in shownPlayers" :key="p.id">
                  <td class="w-10 tabular-nums text-ink-3">{{ players.indexOf(p) + 1 }}.</td>
                  <td>
                    {{ p.name }}
                    <span v-if="p.nickname" class="text-ink-3">„{{ p.nickname }}“</span>
                  </td>
                  <td class="text-right text-ink-3">{{ p.club ?? '' }}</td>
                </tr>
                <tr v-if="!shownPlayers.length">
                  <td colspan="3" class="py-6 text-center text-ink-3">Nikdo neodpovídá hledání.</td>
                </tr>
              </tbody>
            </table>
          </template>
        </AppCard>
      </div>
    </AppSection>

    <AppSection v-if="cup" :title="`Průběžná tabulka – ${cup.title}`">
      <StandingsTable :cup="cup" />
    </AppSection>
  </div>
</template>

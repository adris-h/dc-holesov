<script setup lang="ts">
import type { Registration, RegistrationStatus } from '~/composables/useRegistrations'

useHead({ title: 'Můj účet – DC Holešov', meta: [{ name: 'robots', content: 'noindex' }] })

const { user, isAdmin, ready, logout } = useAuth()
const { profile, loading: profileLoading, saveProfile } = useProfile()
const { list: myRegs, loading: regsLoading, error: regsError } = useMyRegistrations()
const { cancel } = useRegistrationActions()

// Názvy a data turnajů z obsahu
const { data: tournaments } = await useAsyncData('ucet-tournaments', () =>
  queryCollection('tournaments').all(),
)
const tournamentBySlug = computed(() =>
  Object.fromEntries((tournaments.value ?? []).map(t => [slugFromStem(t.stem as string), t])),
)

// ---- Profil ----
const form = reactive({ name: '', nickname: '', club: '' })
const saving = ref(false)
const saved = ref(false)
const profileError = ref('')

// Naplnit formulář z profilu (nebo ze jména účtu, pokud profil ještě není)
watch([profile, user], () => {
  if (saving.value) return
  form.name = profile.value?.name ?? user.value?.name ?? ''
  form.nickname = profile.value?.nickname ?? ''
  form.club = profile.value?.club ?? ''
}, { immediate: true })

const dirty = computed(() =>
  form.name.trim() !== (profile.value?.name ?? '')
  || form.nickname.trim() !== (profile.value?.nickname ?? '')
  || form.club.trim() !== (profile.value?.club ?? ''),
)

async function onSave() {
  if (form.name.trim().length < 3 || saving.value) return
  saving.value = true
  saved.value = false
  profileError.value = ''
  try {
    await saveProfile({ ...form })
    saved.value = true
  }
  catch (e) {
    profileError.value = firebaseErrorMessage(e)
  }
  finally {
    saving.value = false
  }
}

// ---- Moje přihlášky ----
const STATUS_TEXT: Record<RegistrationStatus, string> = { pending: 'Čeká na schválení', accepted: 'Schváleno', rejected: 'Zamítnuto' }
const STATUS_CLASS: Record<RegistrationStatus, string> = {
  pending: 'bg-[#FFF4D6] text-[#8A5A00]',
  accepted: 'bg-accent-tint text-accent-dark',
  rejected: 'bg-bg-2 text-ink-3',
}
const today = new Date().toISOString().slice(0, 10)
// Nadcházející nahoře, pak proběhlé
const sortedRegs = computed(() => [...myRegs.value].sort((a, b) => {
  const da = tournamentBySlug.value[a.tournament]?.date ?? ''
  const db = tournamentBySlug.value[b.tournament]?.date ?? ''
  const pa = da < today
  const pb = db < today
  return pa === pb ? (pa ? db.localeCompare(da) : da.localeCompare(db)) : (pa ? 1 : -1)
}))

const confirmCancel = ref<string | null>(null)
const busy = ref<string | null>(null)
const cancelError = ref('')
async function onCancel(r: Registration) {
  if (confirmCancel.value !== r.id) {
    confirmCancel.value = r.id
    return
  }
  confirmCancel.value = null
  busy.value = r.id
  cancelError.value = ''
  try {
    await cancel(r.id)
  }
  catch (e) {
    cancelError.value = firebaseErrorMessage(e)
  }
  finally {
    busy.value = null
  }
}

async function onLogout() {
  await logout()
  await navigateTo('/')
}
</script>

<template>
  <div class="mt-16">
    <PageHead :single="true" title="Můj účet" lead="Profil a přihlášky na turnaje." />

    <AppSection>
      <AppCard v-if="!ready" class="max-w-[480px]"><p class="text-ink-3">Načítám…</p></AppCard>

      <AppCard v-else-if="!user" class="flex max-w-[480px] flex-col items-start gap-4">
        <p class="text-ink-2">Pro zobrazení účtu se přihlaste.</p>
        <div class="flex flex-wrap gap-3">
          <AppButton to="/prihlasit?redirect=/ucet" variant="primary" size="lg" arrow>Přihlásit se</AppButton>
          <AppButton to="/registrace" size="lg">Založit účet</AppButton>
        </div>
      </AppCard>

      <div v-else class="flex flex-col gap-10">
        <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-3">
          <span>
            Přihlášen jako <strong class="font-medium text-ink">{{ user.email }}</strong>
            <span v-if="isAdmin" class="ml-2 rounded-full bg-ink px-2.5 py-0.5 text-[12.5px] text-white">Pořadatel</span>
          </span>
          <span class="flex items-center gap-4">
            <NuxtLink v-if="isAdmin" to="/admin" class="text-accent-dark underline">Administrace</NuxtLink>
            <button type="button" class="text-accent-dark underline" @click="onLogout">Odhlásit se</button>
          </span>
        </div>

        <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <!-- Profil -->
          <AppCard>
            <h2 class="mb-1 text-xl font-medium tracking-tight2">Profil</h2>
            <p class="mb-5 text-sm text-ink-3">Tyto údaje se předvyplní do přihlášek na turnaje.</p>
            <p v-if="profileLoading" class="text-ink-3">Načítám…</p>
            <form v-else class="flex flex-col gap-5" @submit.prevent="onSave">
              <FormField v-model="form.name" label="Jméno a příjmení" autocomplete="name" :maxlength="PROFILE_LIMITS.name" required />
              <FormField v-model="form.nickname" label="Přezdívka" :maxlength="PROFILE_LIMITS.nickname" />
              <FormField v-model="form.club" label="Klub / Město" :maxlength="PROFILE_LIMITS.club" />
              <p v-if="profileError" class="rounded-lg bg-accent-tint px-4 py-3 text-sm text-accent-dark" role="alert">{{ profileError }}</p>
              <div class="flex items-center gap-4">
                <AppButton
                  type="submit"
                  variant="primary"
                  :disabled="saving || !dirty || form.name.trim().length < 3"
                  class="disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {{ saving ? 'Ukládám…' : 'Uložit' }}
                </AppButton>
                <span v-if="saved && !dirty" class="text-sm text-ink-3" role="status">Uloženo</span>
              </div>
            </form>
          </AppCard>

          <!-- Přihlášky -->
          <div>
            <h2 class="mb-4 text-xl font-medium tracking-tight2">Moje přihlášky</h2>
            <p v-if="regsError" class="mb-4 rounded-lg bg-accent-tint px-4 py-3 text-sm text-accent-dark" role="alert">{{ regsError }}</p>
            <p v-if="cancelError" class="mb-4 rounded-lg bg-accent-tint px-4 py-3 text-sm text-accent-dark" role="alert">{{ cancelError }}</p>

            <AppCard v-if="regsLoading"><p class="text-ink-3">Načítám…</p></AppCard>
            <AppCard v-else-if="!myRegs.length" class="flex flex-col items-start gap-4">
              <p class="text-ink-2">Zatím nemáte žádnou přihlášku.</p>
              <AppButton to="/kalendar" variant="primary" arrow>Kalendář turnajů</AppButton>
            </AppCard>

            <AppTable v-else>
              <thead>
                <tr class="[&_th]:!px-4">
                  <th>Turnaj</th>
                  <th>Hráč</th>
                  <th>Stav</th>
                  <th class="text-right" />
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in sortedRegs" :key="r.id" class="[&_td]:!px-4" :class="{ 'opacity-60': busy === r.id }">
                  <td>
                    <NuxtLink
                      v-if="tournamentBySlug[r.tournament]"
                      :to="`/kalendar/${r.tournament}`"
                      class="font-medium hover:text-accent"
                    >
                      {{ tournamentBySlug[r.tournament]!.title }}
                    </NuxtLink>
                    <span v-else class="font-medium">{{ r.tournament }}</span>
                    <span class="block text-sm text-ink-3">
                      {{ formatDate(tournamentBySlug[r.tournament]?.date) }}
                      · odesláno {{ formatDateTime(r.createdAt) }}
                    </span>
                  </td>
                  <td>
                    {{ r.name }}
                    <span v-if="r.nickname" class="block text-sm text-ink-3">„{{ r.nickname }}“</span>
                  </td>
                  <td>
                    <span class="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px]" :class="STATUS_CLASS[r.status]">
                      {{ STATUS_TEXT[r.status] }}
                    </span>
                  </td>
                  <td class="text-right">
                    <button
                      v-if="r.status === 'pending'"
                      type="button"
                      class="rounded-md px-3 py-1.5 text-[13.5px] font-medium transition-colors disabled:opacity-40"
                      :class="confirmCancel === r.id ? 'bg-ink text-white' : 'text-ink-3 hover:text-accent-dark'"
                      :disabled="busy === r.id"
                      @click="onCancel(r)"
                      @blur="confirmCancel = confirmCancel === r.id ? null : confirmCancel"
                    >
                      {{ confirmCancel === r.id ? 'Opravdu stáhnout?' : 'Stáhnout' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </AppTable>
            <p class="mt-3 text-sm text-ink-3">
              Schválenou přihlášku zrušíte u pořadatele (<NuxtLink to="/kontakt" class="text-accent-dark underline">kontakt</NuxtLink>).
            </p>
          </div>
        </div>
      </div>
    </AppSection>
  </div>
</template>

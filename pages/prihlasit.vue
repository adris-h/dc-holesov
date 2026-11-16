<script setup lang="ts">
useHead({ title: 'Přihlásit se – DC Holešov', meta: [{ name: 'robots', content: 'noindex' }] })

const { user, isAdmin, ready, login, resetPassword, logout } = useAuth()
const route = useRoute()
const redirect = computed(() => {
  const r = route.query.redirect
  // jen interní cesty
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : null
})

const mode = ref<'login' | 'reset'>('login')
const email = ref('')
const password = ref('')
const sending = ref(false)
const error = ref('')
const resetSent = ref(false)

async function onLogin() {
  if (!email.value || !password.value || sending.value) return
  sending.value = true
  error.value = ''
  try {
    const admin = await login(email.value, password.value)
    password.value = ''
    await navigateTo(redirect.value ?? (admin ? '/admin' : '/ucet'))
  }
  catch (e) {
    error.value = firebaseErrorMessage(e)
  }
  finally {
    sending.value = false
  }
}

async function onReset() {
  if (!email.value || sending.value) return
  sending.value = true
  error.value = ''
  try {
    await resetPassword(email.value)
    resetSent.value = true
  }
  catch (e) {
    error.value = firebaseErrorMessage(e)
  }
  finally {
    sending.value = false
  }
}

function switchMode(m: 'login' | 'reset') {
  mode.value = m
  error.value = ''
  resetSent.value = false
}
</script>

<template>
  <div class="mt-16">
    <PageHead :single="true" title="Přihlásit se" lead="Účet pro hráče i pořadatele klubu." />
    <AppSection>
      <div class="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <AppCard class="max-w-[480px]">
          <!-- Čekání na Firebase -->
          <p v-if="!ready" class="text-ink-3">Načítám…</p>

          <!-- Už přihlášený -->
          <div v-else-if="user" class="flex flex-col items-start gap-4">
            <p class="text-ink-2">
              Přihlášen jako <strong class="font-medium text-ink">{{ user.name || user.email }}</strong>.
            </p>
            <div class="flex flex-wrap gap-3">
              <AppButton v-if="isAdmin" to="/admin" variant="primary" size="lg" arrow>Administrace</AppButton>
              <AppButton to="/ucet" :variant="isAdmin ? 'light' : 'primary'" size="lg">Můj účet</AppButton>
              <AppButton size="lg" @click="logout">Odhlásit se</AppButton>
            </div>
          </div>

          <!-- Zapomenuté heslo -->
          <div v-else-if="mode === 'reset'" class="flex flex-col gap-5">
            <h3 class="text-lg font-medium tracking-tight2">Obnovení hesla</h3>
            <p v-if="resetSent" class="rounded-lg bg-accent-tint px-4 py-3 text-sm text-accent-dark" role="status">
              Pokud účet s e-mailem {{ email }} existuje, poslali jsme na něj odkaz pro nastavení nového hesla.
            </p>
            <form v-else class="flex flex-col gap-5" @submit.prevent="onReset">
              <FormField v-model="email" label="E-mail" type="email" autocomplete="username" required />
              <p v-if="error" class="rounded-lg bg-accent-tint px-4 py-3 text-sm text-accent-dark" role="alert">{{ error }}</p>
              <AppButton type="submit" variant="primary" size="lg" :disabled="sending || !email" class="disabled:cursor-not-allowed disabled:opacity-50">
                {{ sending ? 'Odesílám…' : 'Poslat odkaz' }}
              </AppButton>
            </form>
            <button type="button" class="self-start text-sm text-accent-dark underline" @click="switchMode('login')">Zpět na přihlášení</button>
          </div>

          <!-- Přihlášení -->
          <div v-else class="flex flex-col gap-5">
            <form class="flex flex-col gap-5" @submit.prevent="onLogin">
              <FormField v-model="email" label="E-mail" type="email" autocomplete="username" required />
              <FormField v-model="password" label="Heslo" type="password" autocomplete="current-password" required />
              <p v-if="error" class="rounded-lg bg-accent-tint px-4 py-3 text-sm text-accent-dark" role="alert">{{ error }}</p>
              <AppButton
                type="submit"
                variant="primary"
                size="lg"
                :disabled="sending || !email || !password"
                class="disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ sending ? 'Přihlašuji…' : 'Přihlásit se' }}
              </AppButton>
            </form>
            <div class="flex flex-wrap justify-between gap-3 text-sm">
              <button type="button" class="text-accent-dark underline" @click="switchMode('reset')">Zapomenuté heslo</button>
              <span class="text-ink-3">
                Nemáte účet?
                <NuxtLink :to="redirect ? `/registrace?redirect=${encodeURIComponent(redirect)}` : '/registrace'" class="text-accent-dark underline">Založit účet</NuxtLink>
              </span>
            </div>
          </div>
        </AppCard>

        <div class="divide-y divide-line self-start border-y border-line">
          <div class="py-6">
            <h3 class="text-lg font-medium tracking-tight">Proč účet?</h3>
            <p class="mt-1 text-ink-3">Přihláška na turnaj se vyplní sama a v sekci Můj účet vidíte, jestli ji pořadatel schválil.</p>
          </div>
          <div class="py-6">
            <h3 class="text-lg font-medium tracking-tight">Pořadatel</h3>
            <p class="mt-1 text-ink-3">info@dcholesov.cz</p>
            <p class="text-ink-3">+420 000 000 000</p>
          </div>
        </div>
      </div>
    </AppSection>
  </div>
</template>

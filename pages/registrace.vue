<script setup lang="ts">
useHead({ title: 'Založit účet – DC Holešov', meta: [{ name: 'robots', content: 'noindex' }] })

const { user, ready, register } = useAuth()
const route = useRoute()
const redirect = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : null
})

const form = reactive({ name: '', email: '', password: '', password2: '', nickname: '', club: '' })
const sending = ref(false)
const error = ref('')

const problems = computed(() => {
  const p: string[] = []
  if (form.password && form.password.length < 8) p.push('Heslo musí mít alespoň 8 znaků.')
  if (form.password2 && form.password !== form.password2) p.push('Hesla se neshodují.')
  return p
})
const canSubmit = computed(() =>
  form.name.trim().length >= 3 && form.email.includes('@') && form.password.length >= 8
  && form.password === form.password2 && !sending.value,
)

async function onSubmit() {
  if (!canSubmit.value) return
  sending.value = true
  error.value = ''
  try {
    await register({ name: form.name, email: form.email, password: form.password, nickname: form.nickname, club: form.club })
    await navigateTo(redirect.value ?? '/ucet')
  }
  catch (e) {
    error.value = firebaseErrorMessage(e)
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="mt-16">
    <PageHead :single="true" title="Založit účet" lead="Účet si může založit každý hráč. Přihlášky na turnaje pak vyplníte jedním klikem." />
    <AppSection>
      <div class="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <AppCard class="max-w-[520px]">
          <p v-if="!ready" class="text-ink-3">Načítám…</p>

          <div v-else-if="user" class="flex flex-col items-start gap-4">
            <p class="text-ink-2">Už jste přihlášen jako <strong class="font-medium text-ink">{{ user.email }}</strong>.</p>
            <AppButton to="/ucet" variant="primary" size="lg" arrow>Můj účet</AppButton>
          </div>

          <form v-else class="flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
            <FormField v-model="form.name" label="Jméno a příjmení" autocomplete="name" :maxlength="PROFILE_LIMITS.name" required />
            <FormField v-model="form.email" label="E-mail" type="email" autocomplete="email" required />
            <div class="grid gap-5 sm:grid-cols-2">
              <FormField v-model="form.password" label="Heslo" type="password" autocomplete="new-password" hint="Alespoň 8 znaků." required />
              <FormField v-model="form.password2" label="Heslo znovu" type="password" autocomplete="new-password" required />
            </div>
            <div class="grid gap-5 sm:grid-cols-2">
              <FormField v-model="form.nickname" label="Přezdívka (volitelné)" :maxlength="PROFILE_LIMITS.nickname" />
              <FormField v-model="form.club" label="Klub / Město (volitelné)" :maxlength="PROFILE_LIMITS.club" />
            </div>

            <ul v-if="problems.length" class="text-sm text-accent-dark">
              <li v-for="p in problems" :key="p">{{ p }}</li>
            </ul>
            <p v-if="error" class="rounded-lg bg-accent-tint px-4 py-3 text-sm text-accent-dark" role="alert">{{ error }}</p>

            <AppButton type="submit" variant="primary" size="lg" :disabled="!canSubmit" class="disabled:cursor-not-allowed disabled:opacity-50">
              {{ sending ? 'Zakládám účet…' : 'Založit účet' }}
            </AppButton>
            <p class="text-sm text-ink-3">
              Už máte účet?
              <NuxtLink :to="redirect ? `/prihlasit?redirect=${encodeURIComponent(redirect)}` : '/prihlasit'" class="text-accent-dark underline">Přihlaste se</NuxtLink>
            </p>
          </form>
        </AppCard>

        <div class="divide-y divide-line self-start border-y border-line">
          <div class="py-6">
            <h3 class="text-lg font-medium tracking-tight">Co s účtem získáte</h3>
            <ul class="mt-2 flex list-disc flex-col gap-1 pl-5 text-ink-3 marker:text-accent">
              <li>Předvyplněné přihlášky na turnaje</li>
              <li>Přehled svých přihlášek a jejich stavu</li>
              <li>Možnost stáhnout čekající přihlášku</li>
            </ul>
          </div>
          <div class="py-6">
            <h3 class="text-lg font-medium tracking-tight">Soukromí</h3>
            <p class="mt-1 text-ink-3">E-mail uvidí jen pořadatelé. Veřejně se po schválení zobrazí jen jméno, přezdívka a klub v seznamu přihlášených.</p>
          </div>
        </div>
      </div>
    </AppSection>
  </div>
</template>

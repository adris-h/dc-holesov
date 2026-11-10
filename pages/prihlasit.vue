<script setup lang="ts">
</script>
<template>
  <div class="mt-16">
    <PageHead :single="true" title="Přihlásit se" lead="Přihlášení pro členy a pořadatele klubu." />
    <AppSection>
      <div class="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <AppCard class="max-w-[480px]">
          <form class="flex flex-col gap-5" @submit.prevent>
            <FormField label="E-mail" type="email" />
            <FormField label="Heslo" type="password" />
            <AppButton type="submit" variant="primary" size="lg">Přihlásit se</AppButton>
          </form>
        </AppCard>
        <div class="divide-y divide-line self-start border-y border-line">
          <div class="py-6">
            <h3 class="text-lg font-medium tracking-tight">Pořadatel</h3>
            <p class="mt-1 text-ink-3">info@dcholesov.cz</p>
            <p class="text-ink-3">+420 000 000 000</p>
          </div>
          <div class="py-6">
            <h3 class="text-lg font-medium tracking-tight">Sítě</h3>
            <a href="https://www.facebook.com/groups/285358988620699" target="_blank" class="mt-1 text-ink-3">Facebook skupina</a>
          </div>
        </div>
      </div>
    </AppSection>
  </div>
</template>

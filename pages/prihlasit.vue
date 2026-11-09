<template>
  <div>
    <PageHead :single="true" title="Přihlásit se" lead="Přihlášení pro členy a pořadatele klubu." />

    <AppSection>
      <AppCard class="max-w-[480px]">
        <form class="flex flex-col gap-5" @submit.prevent>
          <FormField label="E-mail" type="email" />
          <FormField label="Heslo" type="password" />
          <AppButton type="submit" variant="primary" size="lg">Přihlásit se</AppButton>
        </form>
      </AppCard>
    </AppSection>
  </div>
</template>

<script setup lang="ts">
</script>
<template>
  <div>
    <form class="flex flex-col gap-5" @submit.prevent>
      <FormField label="E-mail" type="email" />
      <FormField label="Heslo" type="password" />
      <AppButton type="submit" variant="primary" size="lg">Přihlásit se</AppButton>
    </form>
  </div>
</template>

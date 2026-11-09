<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-20 md:py-14">
    <h2 v-if="title" class="mb-6 text-2xl font-light tracking-tight2 md:text-[28px]">{{ title }}</h2>
    <slot />
  </section>
</template>

<script setup lang="ts" generic="T extends string | number">
// Rozbalovací výběr pro filtry tabulek – vlastní šipka s odsazením místo nativní.
defineProps<{ label: string }>()
const model = defineModel<T>({ required: true })
</script>

<template>
  <label class="flex flex-col gap-1.5">
    <span class="text-sm text-ink-3">{{ label }}</span>
    <span class="relative">
      <select v-model="model" :class="[FILTER_INPUT, 'w-full cursor-pointer appearance-none pr-12']">
        <slot />
      </select>
      <svg
          class="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-3"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
      ><path d="m6 9 6 6 6-6" /></svg>
    </span>
  </label>
</template>

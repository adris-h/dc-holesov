<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to?: string
    variant?: 'primary' | 'light'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit'
    arrow?: boolean
  }>(),
  { variant: 'light', size: 'md', type: 'button' },
)

const classes = computed(() => [
  'inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-lg font-sans font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  props.variant === 'primary'
    ? 'bg-accent text-white hover:bg-accent-dark'
    : 'border border-line-strong bg-white text-ink hover:border-ink',
  props.size === 'lg' ? 'px-[26px] py-3.5 text-base' : props.size === 'sm' ? 'px-5 py-3 text-sm' : 'px-4 py-2.5 text-[15px]',
])
</script>

<template>
  <!-- S `to` je to odkaz (NuxtLink), jinak tlačítko -->
  <NuxtLink v-if="to" :to="to" :class="classes">
    <svg
      v-if="arrow"
      class="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    ><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    <slot />
  </NuxtLink>
  <button v-else :type="type" :class="classes">
    <svg
      v-if="arrow"
      class="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    ><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    <slot />
  </button>
</template>

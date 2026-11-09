<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string
    variant?: 'primary' | 'light'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit'
    arrow?: boolean
  }>(),
  { variant: 'light', size: 'md', type: 'button' },
)
</script>

<template>
  <component
    :is="to ? resolveComponent('NuxtLink') : 'button'"
    :to="to"
    :type="to ? undefined : type"
    class="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-lg font-sans font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    :class="[
      variant === 'primary'
        ? 'bg-accent text-white hover:bg-accent-dark'
        : 'border border-line-strong bg-white text-ink hover:border-ink',
      size === 'lg' ? 'px-[26px] py-3.5 text-base' : size === 'sm' ? 'px-5 py-3 text-sm' : 'px-4 py-2.5 text-[15px]',
    ]"
  >
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
  </component>
</template>

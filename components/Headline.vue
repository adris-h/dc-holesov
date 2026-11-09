<script setup lang="ts">
// Nadpis podle Figmy: dva řádky velkými písmeny v Lexendu, druhý řádek větší.
const props = withDefaults(
  defineProps<{ sans: string; serif?: string; size?: 'xl' | 'lg'; tag?: string }>(),
  { size: 'xl', tag: 'h1' },
)
const first = computed(() => (props.size === 'xl' ? 'text-[clamp(52px,5.6vw,80px)]' : 'text-[clamp(40px,4.4vw,64px)]'))
const second = computed(() => (props.size === 'xl' ? 'text-[clamp(60px,7.8vw,112px)]' : 'text-[clamp(48px,6.7vw,96px)]'))
</script>

<template>
  <component :is="tag" class="m-0 flex flex-col font-normal uppercase leading-[0.92] text-ink" :class="size === 'lg' ? 'gap-1.5' : ''">
    <span class="tracking-display" :class="first">{{ sans }}</span>
    <span v-if="serif" class="tracking-[-0.015em]" :class="second">{{ serif }}</span>
  </component>
</template>

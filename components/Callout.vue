<script setup lang="ts">
// Použití v markdownu:
//   ::callout{title="Prezentace" tone="accent"}
//   Text s **formátováním**.
//   ::
withDefaults(defineProps<{ title?: string; tone?: 'default' | 'accent' | 'dark' }>(), { tone: 'default' })
</script>

<template>
  <aside
      class="my-6 rounded-[10px] border px-5 py-4 [&>p:last-child]:mb-0 [&_strong]:text-inherit"
      :class="{
      'border-line bg-surface text-ink-2': tone === 'default',
      'border-accent/30 bg-accent-tint text-accent-dark': tone === 'accent',
      'border-transparent bg-night text-white/80': tone === 'dark',
    }"
  >
    <div v-if="title" class="mb-1 text-sm font-medium" :class="tone === 'dark' ? 'text-white' : tone === 'accent' ? 'text-accent-dark' : 'text-ink'">
      {{ title }}
    </div>
    <slot />
  </aside>
</template>
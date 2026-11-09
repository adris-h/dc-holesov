<script setup lang="ts">
withDefaults(
  defineProps<{ label: string; type?: string; placeholder?: string; textarea?: boolean }>(),
  { type: 'text' },
)
</script>

<template>
  <label class="flex flex-col gap-2">
    <span class="text-sm text-ink-2">{{ label }}</span>
    <textarea
      v-if="textarea"
      class="min-h-[140px] resize-y rounded-lg border border-line-strong bg-white px-4 py-3 font-sans text-base text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
      :placeholder="placeholder"
    />
    <input
      v-else
      class="rounded-lg border border-line-strong bg-white px-4 py-3 font-sans text-base text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
      :type="type"
      :placeholder="placeholder"
    >
  </label>
</template>

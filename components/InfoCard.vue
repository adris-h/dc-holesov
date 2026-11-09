<script setup lang="ts">
defineProps<{ label: string; value: string; sub?: string }>()
</script>

<template>
  <div class="flex min-h-[112px] flex-col justify-between rounded-[10px] border border-line bg-surface px-5 py-[18px]">
    <span class="text-sm text-ink-3">{{ label }}</span>
    <span class="text-2xl font-light leading-[1.15] tracking-tight2">
      {{ value }}
      <span v-if="sub" class="block text-sm tracking-normal text-ink-3" :class="{ '!inline': sub === 'Kč' }">{{ sub }}</span>
    </span>
  </div>
</template>

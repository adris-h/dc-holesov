<script setup lang="ts">
defineProps<{
  slug: string
  title: string
  date: string
  time: string
  place: string
  placeSub?: string
  fee?: number
  capacity?: number
  registered?: number
  status: string
  highlight?: boolean
}>()
</script>

<template>
  <NuxtLink
    :to="`/kalendar/${slug}`"
    class="grid grid-cols-2 items-center gap-x-5 gap-y-4 rounded-[10px] border bg-surface px-[22px] py-5 transition-colors hover:bg-white md:grid-cols-[130px_minmax(0,1fr)_90px_100px_130px]"
    :class="highlight ? 'border-accent' : 'border-line'"
  >
    <div class="text-xl font-light leading-[1.2] tracking-tight2">
      {{ formatDate(date) }}
      <div class="text-sm tracking-normal text-ink-3">{{ time }}</div>
    </div>
    <div class="leading-[1.3]">
      <h3 class="text-lg font-medium tracking-[-0.01em]">{{ title }}</h3>
      <span class="text-sm text-ink-3">{{ place }} {{ placeSub }}</span>
    </div>
    <div class="text-[15px]" :class="{ 'text-ink-3': !fee }">{{ fee ? `${fee} Kč` : '–' }}</div>
    <div class="text-[15px] tabular-nums" :class="{ 'text-ink-3': !capacity }">
      {{ capacity ? `${registered ?? 0} / ${capacity}` : '–' }}
    </div>
    <span
      class="inline-block justify-self-start rounded-full px-3 py-[5px] text-[13.5px] md:justify-self-end"
      :class="status === 'open' ? 'bg-accent-tint text-accent-dark' : 'bg-bg-2 text-ink-2'"
    >
      {{ STATUS_LABEL[status] }}
    </span>
  </NuxtLink>
</template>

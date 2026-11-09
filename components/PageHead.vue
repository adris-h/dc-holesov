<script setup lang="ts">
const props = defineProps<{ title: string; serif?: string; single?: boolean; lead?: string; badge?: string }>()
const parts = computed(() => {
  if (props.single) return { sans: props.title, serif: '' } // celý titulek na jednom řádku
  if (props.serif) return { sans: props.title, serif: props.serif }
  const i = props.title.lastIndexOf(' ')
  return i === -1
      ? { sans: props.title, serif: '' }
      : { sans: props.title.slice(0, i), serif: props.title.slice(i + 1) }
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1440px] px-5 pb-2 pt-10 md:px-20">
    <div class="flex flex-wrap items-end gap-5">
      <Headline :sans="parts.sans" :serif="parts.serif" />
      <span v-if="badge" class="mb-4 rounded bg-accent px-3 py-1.5 text-sm text-white">{{ badge }}</span>
    </div>
    <p v-if="lead" class="mt-6 max-w-xl text-lg text-ink-3">{{ lead }}</p>
  </div>
</template>

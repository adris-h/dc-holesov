<script setup lang="ts">
const props = defineProps<{
  slug: string
  title: string
  date: string
  time: string
  place: string
  placeSub?: string
  fee?: number
  deadline?: string
}>()

defineOptions({ inheritAttrs: false })

const detailLink = computed(() => `/kalendar/${props.slug}`)
const i = props.title.lastIndexOf(' ')
const sans = i === -1 ? props.title : props.title.slice(0, i)
const serif = i === -1 ? '' : props.title.slice(i + 1)
</script>

<template>
  <section class="mx-auto flex min-h-[560px] w-full max-w-[1440px] flex-col justify-center gap-3 px-5 py-16 md:min-h-[760px] md:px-20">
    <div class="flex flex-wrap items-end gap-5">
      <Headline :sans="sans" :serif="serif" />
      <span v-if="deadline" class="mb-4 rounded bg-accent px-3 py-1.5 text-sm text-white">
        Registrace otevřena do {{ formatShortDate(deadline) }}
      </span>
    </div>

    <div class="flex flex-col gap-5">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoCard label="Kdy" :value="formatDate(date)" :sub="`ve ${time}`" />
        <InfoCard label="Kde" :value="place" :sub="placeSub" />
        <InfoCard v-if="fee" label="Startovné" :value="String(fee)" sub="Kč" />
      </div>
      <div class="flex flex-wrap gap-3">
        <AppButton :to="`${detailLink}#prihlaska`" variant="primary" size="lg" arrow>Chci se zúčastnit</AppButton>
        <AppButton :to="detailLink" size="lg">Více informací</AppButton>
      </div>
    </div>
  </section>
</template>

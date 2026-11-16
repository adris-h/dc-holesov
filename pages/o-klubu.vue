<script setup lang="ts">
const { data: page } = await useAsyncData('page-o-klubu', () =>
    queryCollection('pages').where('stem', '=', 'pages/o-klubu').first(),
)
</script>

<template>
  <div v-if="page">
    <PageHead :title="page.title" :lead="page.lead" :single="true" />

    <AppSection>
      <div class="grid items-start gap-x-16 gap-y-10 md:grid-cols-2">
        <Prose>
          <ContentRenderer :value="page" />
        </Prose>

        <div v-if="page.facts?.length" class="flex flex-col">
          <div
              v-for="(f, n) in page.facts"
              :key="f.k"
              class="flex gap-6 border-t border-line-strong py-[18px] text-base"
              :class="{ 'border-b': n === page.facts.length - 1 }"
          >
            <span class="w-[140px] flex-none text-ink-3">{{ f.k }}</span>
            <span>{{ f.v }}</span>
          </div>
        </div>
      </div>
    </AppSection>

    <AppSection v-if="page.board?.length" title="Vedení klubu">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AppCard v-for="m in page.board" :key="m.name" class="flex flex-col gap-1 !px-5 !py-4">
          <span class="text-[15px] font-medium">{{ m.name }}</span>
          <span class="text-sm text-ink-3">{{ m.role }}</span>
        </AppCard>
      </div>
    </AppSection>

    <AppSection v-if="page.sponsors?.length" title="Sponzoři a partneři">
      <p class="mb-6 max-w-2xl text-ink-2">
        Děkujeme všem našim partnerům za podporu holešovského šipkařského sportu.
      </p>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <component
            :is="s.url ? 'a' : 'div'"
            v-for="s in page.sponsors"
            :key="s.name"
            :href="s.url"
            :target="s.url ? '_blank' : undefined"
            :rel="s.url ? 'noopener' : undefined"
            class="flex h-32 items-center justify-center rounded-[10px] border border-line bg-surface p-6 transition hover:border-line-strong"
        >
          <img :src="s.logo" :alt="s.name" :title="s.name" class="max-h-full max-w-full object-contain" loading="lazy">
        </component>
      </div>
    </AppSection>
  </div>
</template>
<script setup lang="ts">
const { data: page } = await useAsyncData('page-o-klubu', () =>
  queryCollection('pages').where('stem', '=', 'pages/o-klubu').first(),
)
</script>

<template>
  <div v-if="page">
    <PageHead :title="page.title" :lead="page.lead" :single="true" />
    <AppSection>
      <Prose>
        <ContentRenderer :value="page" />
      </Prose>
    </AppSection>
  </div>
</template>

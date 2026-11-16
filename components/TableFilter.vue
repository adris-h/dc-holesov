<script setup lang="ts">
// Společná lišta filtrů nad tabulkami: vyhledávání + vlastní ovládací prvky (slot) + počet + zrušení.
withDefaults(defineProps<{
  placeholder?: string
  label?: string
  shown?: number // počet zobrazených řádků
  total?: number // celkový počet řádků
  unit?: string // např. „hráčů“, „zápasů“
  active?: boolean // je nastaven nějaký filtr kromě hledání?
}>(), { placeholder: 'Hledat…', label: 'Hledat', unit: 'řádků' })

const search = defineModel<string>('search', { default: '' })
const emit = defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="mb-4">
    <div class="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
      <label class="flex flex-1 flex-col gap-1.5 md:min-w-[220px] md:max-w-[360px]">
        <span class="text-sm text-ink-3">{{ label }}</span>
        <input v-model="search" type="search" :placeholder="placeholder" :class="FILTER_INPUT">
      </label>

      <slot />

      <button
          v-if="search || active"
          type="button"
          class="py-2.5 text-[15px] text-accent-dark underline md:ml-auto"
          @click="search = ''; emit('reset')"
      >
        Zrušit filtry
      </button>
    </div>
    <p v-if="total != null && (search || active)" class="mt-3 text-sm text-ink-3">
      Zobrazeno {{ shown }} z {{ total }} {{ unit }}
    </p>
  </div>
</template>

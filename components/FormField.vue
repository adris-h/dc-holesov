<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    type?: string
    placeholder?: string
    textarea?: boolean
    required?: boolean
    maxlength?: number
    autocomplete?: string
    disabled?: boolean
    hint?: string
  }>(),
  { type: 'text' },
)
// v-model je volitelný – bez něj se pole chová jako dřív
const model = defineModel<string>({ default: '' })
</script>

<template>
  <label class="flex flex-col gap-2">
    <span class="text-sm text-ink-2">
      {{ label }}<span v-if="required" class="text-accent" aria-hidden="true"> *</span>
    </span>
    <textarea
      v-if="textarea"
      v-model="model"
      class="min-h-[140px] resize-y rounded-lg border border-line-strong bg-white px-4 py-3 font-sans text-base text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-60"
      :placeholder="placeholder"
      :required="required"
      :maxlength="maxlength"
      :disabled="disabled"
    />
    <input
      v-else
      v-model="model"
      class="rounded-lg border border-line-strong bg-white px-4 py-3 font-sans text-base text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-60"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :disabled="disabled"
    >
    <span v-if="hint" class="text-[13px] text-ink-3">{{ hint }}</span>
  </label>
</template>

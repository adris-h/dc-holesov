<template>
  <div class="overflow-x-auto rounded-[10px] border border-line bg-surface">
    <table
      class="w-full min-w-[520px] text-left tabular-nums [&_td]:px-5 [&_td]:py-4 [&_th]:border-b [&_th]:border-line [&_th]:bg-bg-2 [&_th]:px-5 [&_th]:py-3 [&_th]:text-sm [&_th]:font-normal [&_th]:text-ink-3 [&_tr+tr_td]:border-t [&_tr+tr_td]:border-line"
    >
      <slot />
    </table>
  </div>
</template>

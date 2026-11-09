<script setup lang="ts">
const links = [
  { to: '/', label: 'Domů' },
  { to: '/vysledky', label: 'Aktuální Výsledky' },
  { to: '/o-klubu', label: 'O klubu' },
  { to: '/kalendar', label: 'Kalendář' },
  { to: '/kontakt', label: 'Kontakt' },
]
const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (open.value = false))
const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))

const tab = 'rounded-t-md border-b px-3 py-1 text-md  font-light text-black transition-colors'
const tabActive = 'border-accent bg-white shadow-[0_0_8px_rgba(0,0,0,0.06)]'
const tabIdle = 'border-transparent hover:text-accent'
</script>

<template>
  <Header class="fixed w-full z-20 bg-white/60 backdrop-blur-sm">
    <div class="flex h-[63px] items-center justify-between px-5 md:px-8">
      <NuxtLink to="/" class=" font-medium tracking-[-0.01em]">DC Holešov</NuxtLink>

      <nav aria-label="Hlavní menu" class="hidden items-center gap-2 md:flex">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          :class="[tab, isActive(l.to) ? tabActive : tabIdle]"

        >
          {{ l.label }}
        </NuxtLink>
        <NuxtLink
          to="/prihlasit"
          class="ml-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium tracking-[0.02em] text-white transition-colors hover:bg-accent-dark"
        >
          Přihlásit se
        </NuxtLink>
      </nav>

      <button
        class="flex size-10 flex-col items-center justify-center gap-[5px] rounded-lg md:hidden"
        aria-label="Menu"
        :aria-expanded="open"
        @click="open = !open"
      >
        <span class="block h-0.5 w-5 bg-ink" />
        <span class="block h-0.5 w-5 bg-ink" />
        <span class="block h-0.5 w-5 bg-ink" />
      </button>
    </div>

    <nav
      v-show="open"
      class="absolute inset-x-0 top-full flex flex-col gap-0.5 border-b border-line bg-bg px-5 pb-4 pt-2 md:hidden"
    >
      <NuxtLink
        v-for="l in links"
        :key="l.to"
        :to="l.to"
        class="rounded-md px-3 py-3 text-[15px] font-light"
        :class="isActive(l.to) ? 'bg-white' : ''"
      >
        {{ l.label }}
      </NuxtLink>
      <NuxtLink to="/prihlasit" class="mt-2 rounded-lg bg-accent px-4 py-3 text-center text-[15px] font-medium text-white">
        Přihlásit se
      </NuxtLink>
    </nav>
  </Header>
</template>

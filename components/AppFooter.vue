<script setup lang="ts">
</script>
<template>
  <footer class="bg-night-card text-white">
    <div class="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-14 md:grid-cols-[1.8fr_1fr_1fr] md:px-20">
      <p class="text-base font-semibold uppercase tracking-[0.02em]">DC Holešov</p>
      <ul class="flex flex-col gap-1 text-base font-light tracking-[0.02em]">
        <li><NuxtLink to="/kalendar" class="hover:text-white/70">Kalendář</NuxtLink></li>
        <li><NuxtLink to="/vysledky" class="hover:text-white/70">Aktuální Výsledky</NuxtLink></li>
        <li><NuxtLink to="/liga" class="hover:text-white/70">2. liga ČŠO</NuxtLink></li>
        <li><NuxtLink to="/o-klubu" class="hover:text-white/70">O klubu</NuxtLink></li>
        <li><NuxtLink to="/kontakt" class="hover:text-white/70">Kontakt</NuxtLink></li>
      </ul>
      <ul>
        <li><p class="text-base font-light tracking-[0.02em]">info@dcholesov.cz</p></li>
        <li><p class="text-base font-light tracking-[0.02em]">+420 000 000 000</p></li>
      </ul>
    </div>
    <div class="border-t border-white/15">
      <div class="mx-auto w-full max-w-[1440px] px-5 py-5 text-[12.5px] font-medium tracking-[0.02em] md:px-20">
        © 2026 DC Holešov
      </div>
    </div>
  </footer>
</template>

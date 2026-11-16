<script setup lang="ts">
</script>
<template>
  <footer class="bg-night-card text-white">
    <div class="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-14 md:grid-cols-[1.8fr_1fr_1fr] md:px-20">
      <div>
        <p class="text-base font-semibold uppercase tracking-[0.02em]">DC Holešov</p>
        <p class="mt-2 text-sm font-light text-white/70">Bowling Club Holešov<br>Sušilova 339, 769 01 Holešov</p>
      </div>
      <ul class="flex flex-col gap-1 text-base font-light tracking-[0.02em]">
        <li><NuxtLink to="/kalendar" class="hover:text-white/70">Kalendář</NuxtLink></li>
        <li><NuxtLink to="/vysledky" class="hover:text-white/70">Aktuální Výsledky</NuxtLink></li>
        <li><NuxtLink to="/liga" class="hover:text-white/70">2. liga ČŠO</NuxtLink></li>
        <li><NuxtLink to="/o-klubu" class="hover:text-white/70">O klubu</NuxtLink></li>
        <li><NuxtLink to="/kontakt" class="hover:text-white/70">Kontakt</NuxtLink></li>
      </ul>
      <ul class="flex flex-col gap-1 text-base font-light tracking-[0.02em]">
        <li><p>info@dcholesov.cz</p></li>
        <li><p>+420 000 000 000</p></li>
        <li><a href="https://www.facebook.com/share/g/18xzrAyi8U/" target="_blank" rel="noopener" class="hover:text-white/70">Facebook skupina</a></li>
        <li><a href="https://liga.czechdarts.org/tabulka/3f36532d-ed9b-41d0-866b-7edeffd53275/" target="_blank" rel="noopener" class="hover:text-white/70">Ligová tabulka ČŠO</a></li>
      </ul>
    </div>
    <div class="border-t border-white/15">
      <div class="mx-auto w-full max-w-[1440px] px-5 py-5 text-[12.5px] font-medium tracking-[0.02em] md:px-20">
        © 2026 DC Holešov
      </div>
    </div>
  </footer>
</template>
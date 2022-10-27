<script setup>
/**
 * Main page component
 */
import github from "./github.vue";
import Logo from "./logo.vue";
import progressVue from "./progress.vue";
import toggler from "./Toggler.vue";
</script>

<template>
  <main class="sh">
    <progressVue></progressVue>
    <github></github>
    <toggler></toggler>
    <Logo></Logo>
  </main>
</template>
<style scoped>
main {
  position: relative;
  overflow: hidden;
  width: 100vw;
  min-height: 100vh;
  height: 100%;
}
</style>

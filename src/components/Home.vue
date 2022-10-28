<script setup>
/**
 * Main page component
 */
import Github from "./github.vue";
import Logo from "./logo.vue";
import progressVue from "./progress.vue";
import toggler from "./Toggler.vue";
import Footer from "./Footer.vue";
</script>

<template>
  <main class="sh">
    <progressVue></progressVue>
    <Github></Github>
    <toggler></toggler>
    <Logo></Logo>
    <Footer></Footer>
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

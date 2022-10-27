<script setup>
/**
 * Main page component
 */
import github from "./github.vue";
import progressVue from "./progress.vue";
const props = defineProps({});
</script>

<template>
  <main class="sh">
    <progressVue></progressVue>
    <github></github>
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

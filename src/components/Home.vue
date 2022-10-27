<script setup>
import progressVue from "./progress.vue";
const props = defineProps({});
</script>

<template>
  <main class="sh">
    <progressVue></progressVue>
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

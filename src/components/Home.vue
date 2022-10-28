<script setup>
/**
 * Main page component
 */
import Github from "./Github.vue";
import Logo from "./logo.vue";
import progressVue from "./progress.vue";
import toggler from "./Toggler.vue";
import Footer from "./Footer.vue";
import RecorderMain from "./RecorderMain.vue";
</script>

<template>
  <main class="sh">
    <progressVue></progressVue>
    <Github></Github>
    <toggler></toggler>
    <Logo></Logo>
    <RecorderMain></RecorderMain>
    <Footer></Footer>
  </main>
</template>
<style lang="scss">
@import "../scss/utils/all";
main {
  position: relative;
  overflow: hidden;
  width: 100vw;
  min-height: 100vh;
  height: 100%;

  user-select: none;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: $main-font;
  font-size: 1rem;
  font-weight: 400;
  background-color: $white;
  color: $font-color;
  transition: 0.5s $bezier-curve;

  @media (prefers-color-scheme: dark) {
    background-color: $darkest-grey;
    color: $white;
  }
  @media (prefers-color-scheme: light) {
    background-color: $white;
    color: $font-color;
  }
}
</style>

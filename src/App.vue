<script setup>
/**
 * Root component that also handles global css (like the theme switcher)
 */
import Home from "./components/Home.vue";

import { store } from "./store.js";
</script>

<template>
  <Home :data-theme="store.theme"></Home>
</template>

<style lang="scss">
@import "scss/utils/all";

html {
  overflow-x: hidden;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: auto;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial,
    sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
  scroll-behavior: smooth;
}
#app {
  position: relative;
  overflow-x: hidden;
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

[data-theme="dark"] {
  background-color: $darkest-grey;
  color: $white;

  .sh {
    &__toast {
      background-color: $white;
      color: $dark-grey;
    }
  }
}
[data-theme="light"] {
  background-color: $white;
  color: $font-color;

  .sh {
    &__toast {
      background-color: $dark-grey;
      color: $light-grey;
    }
  }
}
</style>

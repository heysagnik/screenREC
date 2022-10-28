<script setup>
/**
 * Progress bar component
 */
</script>
<template>
  <div class="progress"></div>
</template>
<style scoped lang="scss">
@import "../scss/utils/all";
.progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 101vw;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  height: 0.6rem;
  background: $main-gradient;
  animation: fill 0.8s $bezier-curve;
}
</style>

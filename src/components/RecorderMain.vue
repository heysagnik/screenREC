<script setup>
import RecorderChoice from "./RecorderChoice.vue";
import RecorderHeader from "./RecorderHeader.vue";

function launchRecord() {
  console.log("Launched");
}
</script>

<template>
  <section class="recorder">
    <div class="wrp">
      <RecorderHeader></RecorderHeader>
      <RecorderChoice @start-recording="launchRecord" />
    </div>
  </section>
</template>

<style lang="scss">
@import "../scss/utils/all";
.wrp {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.btn {
  padding: 1rem 2.5rem;
  border-radius: 12px;
  min-width: 140px;
  background: $red-gradient;
  color: $white;
  @include fluid-type(768px, 1920px, 14px, 16px);
  font-family: $main-font;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateY(1rem);
  transition: all 0.4s $bezier-curve;

  &.visible {
    pointer-events: all;
    opacity: 1;
    transform: translateY(0);
  }

  &:hover {
    transform: scale(0.94);
    background-position: right center;
  }

  &--wrp {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 2rem;
    gap: 2rem;
  }
}
</style>

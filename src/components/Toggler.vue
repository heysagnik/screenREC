<script setup>
/**
 * Light / Dark mode toggler
 */
import { store } from "../store.js";
import { computed } from "vue";

const moonClasses = computed(() => {
  return store.theme === "dark" ? "" : "active";
});
const sunClasses = computed(() => {
  return store.theme === "dark" ? "active" : "";
});
</script>
<template>
  <span class="toggler" @click="store.toggleTheme">
    <div class="toggler-wrp">
      <span class="toggler-btn--moon" :class="moonClasses">
        <img
          class="toggler--icon moon"
          src="/images/moon.svg"
          alt="dark mode icon"
        />
      </span>
      <span class="toggler-btn--sun" :class="sunClasses">
        <img
          class="toggler--icon sun"
          src="/images/sun.svg"
          alt="light mode icon"
        />
      </span>
    </div>
  </span>
</template>

<style lang="scss">
@import "../scss/utils/all";

[data-theme="dark"] {
  .toggler {
    background-color: $darkest-grey;
    border-color: $grey;
    &:hover {
      border-color: $white;
    }
  }
}

[data-theme="light"] {
  .toggler {
    background-color: $white;
    border-color: $grey;
    &:hover {
      border-color: $dark-grey;
    }
  }
}

.toggler {
  overflow: hidden;
  position: absolute;
  top: 2.5rem;
  right: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.4s $bezier-curve;
  @include disableUserSelect();

  @include mq(md) {
    top: 2rem;
    right: 2rem;
    width: 3rem;
    height: 3rem;
  }

  &:hover {
    border: 2px solid $dark-grey;
    transform: scale(1.1);
  }

  &-wrp {
    position: relative;
    width: 1.5rem;
    height: 1.5rem;

    @include mq(md) {
      width: 2rem;
      height: 2rem;
    }

    span {
      position: absolute;
      inset: 0;
      transform-origin: 50% 100px;
      transform: rotate(90deg);
      transition: transform 0.8s $bezier-curve;
    }
  }

  &-btn {
    &--moon {
      &:is(.active) {
        transform: rotate(0);
        ~ .sh__toggler-btn--sun {
          transform: rotate(-90deg);
        }
      }
    }
    &--sun {
      &:is(.active) {
        transform: rotate(0);
        ~ .sh__toggler-btn--moon {
          transform: rotate(90deg);
        }
      }
    }
  }

  &--icon {
    width: 100%;
  }
}
</style>

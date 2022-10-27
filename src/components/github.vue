<script setup>
/**
 * Star / Fork button
 */
</script>

<template>
  <span class="github">
    <a
      class="github-btn"
      href="http://github.com/heysagnik/screenREC"
      type="button"
      title="Yeah! We are open-sourced 💗"
    >
      Star
    </a>
  </span>
</template>

<style lang="scss">
@import "../scss/utils/all";
[data-theme="dark"] .github {
  background-color: $darkest-grey;
  border-color: $grey;
  &:hover {
    border-color: $white;
  }
}

[data-theme="light"] .github {
  background-color: $white;
  border-color: $grey;
  &:hover {
    border-color: $dark-grey;
  }
}
.github {
  overflow: hidden;
  position: absolute;
  top: 2.4rem;
  right: 5.5rem;
  height: 40px;
  width: 80px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border-radius: 10%;
  border: 2px solid;
  cursor: pointer;
  animation: bounce 2s infinite;
  /*@include disableUserSelect();*/
  &-btn {
    position: relative;
    text-decoration: inherit;
    color: inherit;
  }
  &::before {
    content: "⭐";
  }
}

@keyframes bounce {
  5%,
  50% {
    transform: scale(1);
  }

  10% {
    transform: scale(1);
  }

  15% {
    transform: scale(1);
  }

  20% {
    transform: scale(1) rotate(-5deg);
  }

  25% {
    transform: scale(1) rotate(5deg);
  }

  30% {
    transform: scale(1) rotate(-3deg);
  }

  35% {
    transform: scale(1) rotate(2deg);
  }

  40% {
    transform: scale(1) rotate(0);
  }
}
</style>

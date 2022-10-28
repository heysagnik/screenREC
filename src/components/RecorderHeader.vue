<script setup></script>
<template>
  <div class="header">
    <h2 class="header--title outro">
      <span> Your video is ready to be exported </span>
    </h2>
    <h2 class="header--title recording">
      <span> You are currently <span class="red--text">recording</span> </span>
    </h2>
    <h2 class="header--title intro">
      <span> A simple web screen recorder</span>
    </h2>
  </div>
</template>

<style lang="scss">
@import "../scss/utils/all";
.header {
  display: flex;
  flex-direction: column;

  &--title {
    position: relative;
    overflow: hidden;
    display: inline-block;
    @include fluid-type(768px, 1920px, 20px, 28px);
    line-height: 1.4;
    font-weight: 600;
    text-align: center;

    span {
      display: inline-block;
      transition: transform 0.8s $bezier-curve;
      will-change: transform;

      &.red--text {
        color: $red;
        font-weight: 700;
      }
    }

    &.recording {
      span {
        transform: translateY(100%);
      }
    }
    &.outro {
      span {
        transform: translateY(200%);
      }
    }
  }

  &.is-recording {
    .intro {
      span {
        transform: translateY(-100%);
      }
    }
    .recording {
      span {
        transform: translateY(0);
      }
    }
    .outro {
      span {
        transform: translateY(100%);
      }
    }
  }

  &.is-reviewing {
    .intro {
      span {
        transform: translateY(-200%);
      }
    }
    .recording {
      span {
        transform: translateY(-100%);
      }
    }
    .outro {
      span {
        transform: translateY(0);
      }
    }
  }
}
</style>

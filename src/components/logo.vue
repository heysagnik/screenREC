<script setup>
/**
 * Logo screenRec
 */
</script>

<template>
  <a class="logo">
    <picture class="logo--img">
      <source
        srcset="/images/logo.png?as=avif&amp;width=400"
        type="image/avif"
      />
      <source
        srcset="/images/logo.png?as=webp&amp;width=400"
        type="image/webp"
      />
      <source srcset="/images/logo.png?width=400" type="image/png" />
      <img src="/images/logo.png?width=400" alt="test image" />
    </picture>
    <h1 class="logo--text">Screen <span>REC</span> <sup>βeta</sup></h1>
  </a>
</template>

<style lang="scss">
@import "../scss/utils/all";
.logo {
  position: absolute;
  left: 3%;
  top: 2%;
  width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: inherit;
  transform: scale(0.9);
  transition: all 0.4s $bezier-curve;

  @include mq(md) {
    width: 100%;
    left: 50%;
    transform: translateX(-50%) scale(0.7);
  }

  &--img {
    img {
      width: 100%;
      max-width: 20vw;
      transform: scale(1);

      @include mq(md) {
        max-width: 10vw;
      }
    }
  }

  &--text {
    @include mq(null, md) {
      display: none;
    }

    margin: 0;
    margin-left: 0.8rem;
    @include fluid-type(768px, 1920px, 40px, 56px);
    font-weight: 900;

    span {
      background: linear-gradient(to right, #cb356b, #bd3f32);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    sup {
      font-size: 20px;
      vertical-align: top;
      font-style: italic;
      font-weight:500;
   }
  }
}
</style>

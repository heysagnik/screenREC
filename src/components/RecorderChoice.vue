<script setup>
/**
 * Choice view for the recorder
 */

const emit = defineEmits(["startRecording"]);
</script>
<template>
  <div class="choice">
    <div class="dropdown">
      <button class="dropdown--btn" type="button">
        <img class="dropdown--icon camera" src="/images/camera.svg" />
        <span class="dropdown--defaultOption">
          Select the format of the output video
        </span>
        <img class="dropdown--icon chevron" src="/images/chevron-down.svg" />
      </button>
      <ul class="dropdown__list">
        <li class="dropdown__list--item" data-value="webm">
          WebM - Optimized for web
        </li>
        <li class="dropdown__list--item" data-value="mp4">
          MP4 - Optimized for compatibility
        </li>
      </ul>
    </div>
    <input
      class="choice--filename"
      type="text"
      id="filename"
      placeholder="Name your recording"
    />
    <button
      type="button"
      class="btn record"
      id="start"
      @click="$emit('startRecording')"
    >
      <span class="pulse"></span>
      <span>I’m ready to record</span>
    </button>
  </div>
</template>

<style lang="scss">
@import "../scss/utils/all";
.dropdown {
  position: relative;
  display: flex;
  width: 90%;

  @include mq(md) {
    width: 100%;
    max-width: 35rem;
  }

  &--btn {
    width: 100%;
    display: flex;
    align-items: center;
    background-color: $light-grey;
    color: $grey;
    font-family: $main-font;
    font-size: 0.8rem;
    font-weight: 600;
    margin: 1.5rem 0;
    padding: 1.2rem 1rem;
    border: 2px solid transparent;
    border-radius: $default-radius;
    outline: none;
    cursor: pointer;
    transition: all 0.3s $bezier-curve;

    @include mq(md) {
      padding: 1.2rem 1.8rem;
      @include fluid-type(768px, 1920px, 14px, 18px);
    }

    &:hover {
      background-color: darken($light-grey, 4%);
    }

    span {
      margin-left: 2%;
      margin-right: auto;
    }

    &.toggled {
      border: 2px solid $grey;
    }
  }

  &--icon {
    width: 100%;
    max-width: 1.2rem;
    transition: transform 0.3s $bezier-curve;

    &.camera {
      max-width: 1.5rem;
      @include mq(lg) {
        max-width: 2rem;
      }
    }

    &.toggled {
      transform: rotate(180deg);
    }
  }

  &__list {
    overflow: hidden;
    position: absolute;
    top: 100%;
    z-index: 11;
    width: 100%;
    margin: 0;
    padding: 0.6rem 0.8rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: $light-grey;
    border-radius: $default-radius;
    list-style-type: none;
    text-align: center;
    pointer-events: all;
    opacity: 0;
    transform: scale(0.01);
    transition: all 0.4s $bezier-curve;
    transform-origin: top;

    &--item {
      padding: 0.8rem;
      display: block;
      @include fluid-type(768px, 1920px, 14px, 16px);
      font-weight: 500;
      color: $grey;
      background-color: transparent;
      border-radius: $default-radius;
      cursor: pointer;
      transition: all 0.3s $bezier-curve;

      &:hover {
        background-color: darken(#c3c1c1, 4%);
      }
    }

    &.open {
      transform: scaleY(1);
      opacity: 1;
      pointer-events: all;
    }
  }
}
.choice {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  &.hide {
    display: none;
  }

  &--filename {
    position: relative;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    width: 90%;
    max-width: 35rem;
    color: $grey;
    font-weight: 600;
    border-radius: $default-radius;
    border: none;
    outline: none;
    visibility: hidden;
    opacity: 0;
    display: flex;
    padding-top: 1.2rem;
    padding-bottom: 1.2rem;
    padding-left: 1rem;
    padding-right: 1rem;

    &::placeholder {
      margin-left: 10px;
      font-weight: 600;
      color: $grey;
    }

    &.visible {
      visibility: visible;
      opacity: 1;
    }
  }

  .record {
    display: flex;
    align-items: center;

    .pulse {
      position: relative;
      margin-right: 1.3rem;
      width: 0.8rem;
      height: 0.8rem;
      display: inline-block;
      background-color: $white;
      border-radius: 50%;

      &:after {
        content: "";
        position: absolute;
        z-index: 1;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        border-radius: inherit;
        background-color: transparent;
        animation: pulse 2s infinite;
      }
    }
  }
}
</style>

<template>
  <footer class="footer">
    <div class="footer-wrp">
      <h2 class="footer--text">
        Built with&nbsp;
        <picture class="footer--love-icon">
          <source
            srcset="/images/heart.svg?as=avif&amp;width=80"
            type="image/avif"
          />
          <source
            srcset="/images/heart.svg?as=webp&amp;width=80"
            type="image/webp"
          />
          <source srcset="/images/heart.svg?width=80" type="image/png" />
          <img src="/images/heart.svg?width=80" alt="heart icon" /> </picture
        >&nbsp;by&nbsp;<a class="footer--user" href="https://sagniksahoo.codes"
          ><span>Sagnik </span>
          <picture class="footer--user-icon">
            <source
              srcset="/images/sagnik.png?as=avif&amp;width=100"
              type="image/avif"
            />
            <source
              srcset="/images/sagnik.png?as=webp&amp;width=100"
              type="image/webp"
            />
            <source srcset="/images/sagnik.png?width=100" type="image/jpg" />
            <img
              src="/images/sagnik.png?width=100"
              alt="sagnik icon"
            /> </picture
        ></a>
      </h2>
    </div>
  </footer>
</template>
<style lang="scss">
@import "../scss/utils/all";
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: auto;
  padding: 0.7rem 0.5rem;

  &-wrp {
    max-width: 95%;
    margin: 0 auto;
  }

  &--text {
    display: flex;
    align-items: center;
    justify-content: center;
    @include fluid-type(768px, 1920px, 12px, 14px);
    font-weight: 500;
    text-align: center;
  }

  &--user {
    display: flex;
    align-items: center;
    color: inherit;
    cursor: pointer;

    &:hover {
      span {
        opacity: 0.7;
      }
    }

    span {
      text-decoration: underline;
      font-weight: 600;
      color: inherit;
      transition: opacity 0.4s $bezier-curve;
    }

    &-icon {
      img {
        margin-left: 0.3rem;
        max-width: 1.5rem;
        border-radius: 50%;
        transition: opacity 0.4s $bezier-curve;
      }
    }
  }

  &--love {
    &-icon {
      img {
        max-width: 1rem;
      }

      &:hover {
        animation: pump 1s infinite;
      }
    }
  }
}
</style>

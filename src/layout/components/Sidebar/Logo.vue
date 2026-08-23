<template>
  <div class="sidebar-logo-container" :class="{ collapse: collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="collapse"
        key="collapse"
        class="sidebar-logo-link"
        to="/"
      >
        <span class="brand-mark">T</span>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <span class="brand-mark">T</span>
        <span class="brand-copy">
          <strong class="sidebar-title">{{ title }}</strong>
          <small>LIQUID GLASS</small>
        </span>
      </router-link>
    </transition>
  </div>
</template>

<script>
import { setting } from '@/api/system'

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: '',
      logo: '/api/image/logo'
    }
  },
  created() {
    this.setting()
  },
  methods: {
    setting() {
      setting().then((response) => {
        this.title = response.data.systemName
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: transparent;
  text-align: left;
  overflow: hidden;

  & .sidebar-logo-link {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 100%;
    width: 100%;
    padding: 0 11px;

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
    }

    & .sidebar-title {
      display: block;
      margin: 0;
      color: var(--ink);
      font-weight: 700;
      line-height: 1.2;
      font-size: 14px;
    }
  }

  .brand-mark {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    color: #fff;
    background: linear-gradient(
        155deg,
        rgba(255, 255, 255, 0.48),
        transparent 54%
      ),
      linear-gradient(135deg, #0a84ff, #5e5ce6);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.62),
      0 8px 20px -8px rgba(30, 60, 200, 0.62);
    font-size: 17px;
    font-weight: 800;
  }

  .brand-copy {
    min-width: 0;

    small {
      display: block;
      margin-top: 2px;
      color: var(--ink-3);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.12em;
    }
  }

  &.collapse {
    .sidebar-logo-link {
      justify-content: center;
      padding: 0;
    }
  }
}
</style>

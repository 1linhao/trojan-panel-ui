<template>
  <div class="navbar liquid-glass liquid-raised">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device !== 'mobile'">
        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <liquid-tooltip
          :content="$t('navbar.size')"
          effect="dark"
          placement="bottom"
        >
          <SizeSelect id="size-select" class="right-menu-item hover-effect" />
        </liquid-tooltip>

        <lang-select class="right-menu-item hover-effect" />
      </template>
      <liquid-theme-toggle class="right-menu-item" />
      <liquid-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <span class="user-avatar">{{ userInitials }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <liquid-dropdown-menu slot="dropdown" class="user-dropdown">
          <liquid-dropdown-item @click.native="goProfile">
            {{ $t('navbar.profile') }}
          </liquid-dropdown-item>
          <a
            target="_blank"
            href="https://github.com/trojanpanel"
            v-if="checkPermission(['sysadmin', 'admin'])"
          >
            <liquid-dropdown-item>{{ $t('navbar.github') }}</liquid-dropdown-item>
          </a>
          <a
            target="_blank"
            href="https://trojanpanel.github.io"
            v-if="checkPermission(['sysadmin', 'admin'])"
          >
            <liquid-dropdown-item>{{ $t('navbar.doc') }}</liquid-dropdown-item>
          </a>
          <liquid-dropdown-item divided @click.native="logout">
            <span style="display: block">{{ $t('navbar.logout') }}</span>
          </liquid-dropdown-item>
        </liquid-dropdown-menu>
      </liquid-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import LangSelect from '@/components/LangSelect'
import LiquidThemeToggle from '@/components/LiquidThemeToggle'
import checkPermission from '@/utils/permission' // 权限判断指令

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    SizeSelect,
    LangSelect,
    LiquidThemeToggle
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'device', 'username']),
    userInitials() {
      return (this.username || 'TP').slice(0, 2).toUpperCase()
    }
  },
  methods: {
    checkPermission,
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    goProfile() {
      if (this.$route.path !== '/modify/index') {
        this.$router.push('/modify/index').catch(() => true)
      }
    },
    async logout() {
      await this.$store.dispatch('account/logout')
      await this.$router.push(`/login`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 58px;
  overflow: visible;
  position: relative;
  color: var(--ink);
  background: transparent;
  box-shadow: none;

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: var(--ink-2);
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: var(--glass-soft);
        }
      }
    }

    .avatar-container {
      margin-right: 20px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          display: grid;
          place-items: center;
          cursor: pointer;
          width: 38px;
          height: 38px;
          border-radius: 14px;
          color: var(--on-accent);
          background: linear-gradient(135deg, var(--accent), var(--accent-deep));
          box-shadow: inset 0 1px 0 var(--spec),
            0 8px 18px -10px color-mix(in srgb, var(--accent) 70%, transparent);
          font-size: 12px;
          font-weight: 800;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 24px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>

<template>
  <liquid-app-shell :model="shellModel" @navigate="go" @logout="logout">
    <template #navigation-item="{ item }">
      <liquid-nav-icon :name="item.icon" />
      <span>{{ item.label }}</span>
    </template>

    <div slot="header-actions" class="trojan-shell-actions">
      <liquid-button
        v-if="isLocalPreview"
        size="small"
        :title="isAdmin ? '切换到普通用户演示' : '切换到管理员演示'"
        @click="switchPreviewRole"
      >
        {{ isAdmin ? '普通用户' : '管理员' }}
      </liquid-button>
      <liquid-theme-toggle />
    </div>

    <app-main />
  </liquid-app-shell>
</template>

<script>
import { mapGetters } from 'vuex'
import { LiquidAppShell } from '@liqui/liquid-app-shell'
import {
  LiquidButton,
  LiquidNavIcon,
  LiquidThemeToggle
} from '@liqui/liquid-ui'
import { createTrojanPanelShellModel } from '@/adapters/trojan-panel-shell'
import { setToken } from '@/utils/auth'
import AppMain from './components/AppMain'

export default {
  name: 'TrojanPanelLayout',
  components: {
    AppMain,
    LiquidAppShell,
    LiquidButton,
    LiquidNavIcon,
    LiquidThemeToggle
  },
  computed: {
    ...mapGetters(['roles', 'username']),
    isAdmin() {
      return this.roles.some(role => role === 'sysadmin' || role === 'admin')
    },
    isLocalPreview() {
      return (
        process.env.NODE_ENV === 'development' &&
        ['127.0.0.1', 'localhost'].includes(window.location.hostname)
      )
    },
    shellModel() {
      return createTrojanPanelShellModel({
        roles: this.roles,
        username: this.username,
        activePath: this.$route.path,
        fallbackTitle: this.$t(`route.${this.$route.meta.title}`)
      })
    }
  },
  methods: {
    switchPreviewRole() {
      const target = this.isAdmin ? 'user' : 'admin'
      setToken(`Bearer ${target === 'user' ? 'user-token' : 'mock-token'}`)
      window.location.assign(
        `${window.location.origin}/?previewRole=${target}#/dashboard/index`
      )
    },
    go(path) {
      if (path !== this.$route.path) this.$router.push(path).catch(() => true)
    },
    async logout() {
      await this.$store.dispatch('account/logout')
      await this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.trojan-shell-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

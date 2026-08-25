<template>
  <div class="prototype-shell">
    <aside class="prototype-side glass raised">
      <button
        class="prototype-brand"
        type="button"
        @click="go('/dashboard/index')"
      >
        <span class="brand-mark">T</span>
        <span><strong>Trojan Panel</strong><small>LIQUID GLASS</small></span>
      </button>
      <template v-for="group in visibleGroups">
        <div :key="`${group.label}-label`" class="prototype-nav-group">
          {{ group.label }}
        </div>
        <button
          v-for="item in group.items"
          :key="item.path"
          :class="['prototype-nav-item', { on: activePath === item.path }]"
          type="button"
          @click="go(item.path)"
        >
          <i :class="['prototype-menu-icon', item.uiIcon]" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </button>
      </template>
    </aside>

    <main class="prototype-main">
      <header class="prototype-topbar glass raised">
        <h1>{{ pageTitle }}</h1>
        <div class="prototype-topbar-actions">
          <button
            v-if="isLocalPreview"
            class="cap small local-role-preview"
            type="button"
            :title="isAdmin ? '切换到普通用户演示' : '切换到管理员演示'"
            @click="switchPreviewRole"
          >
            <i :class="isAdmin ? 'liquid-icon--user' : 'liquid-icon--setting'" aria-hidden="true" />
            <span>{{ isAdmin ? '普通用户' : '管理员' }}</span>
          </button>
          <liquid-theme-toggle />
          <div class="prototype-user-pill prototype-topbar-user">
            <span class="prototype-avatar">{{ initials }}</span>
            <strong>{{ username || 'Trojan Panel' }}</strong>
            <button
              class="prototype-icon-btn"
              type="button"
              title="退出登录"
              aria-label="退出登录"
              @click="logout"
            >
              <i class="liquid-icon--switch-button" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <section class="prototype-content"><app-main /></section>
    </main>

    <nav
      ref="mobileNav"
      :class="['prototype-mobile-nav', 'seg', { 'is-scrollable': mobileItems.length > 5 }]"
      aria-label="移动端功能导航"
    >
      <button
        v-for="item in mobileItems"
        ref="mobileNavItems"
        :key="item.path"
        :class="{ on: activePath === item.path }"
        type="button"
        @click="go(item.path)"
      >
        <liquid-nav-icon :name="item.icon" class="prototype-mobile-icon" />
        <span>{{ item.mobileLabel || item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { AppMain } from './components'
import LiquidThemeToggle from '@/components/LiquidThemeToggle'
import LiquidNavIcon from '@/components/LiquidNavIcon'
import { setToken } from '@/utils/auth'

const ADMIN_GROUPS = [
  {
    label: '概览',
    items: [
      {
        path: '/dashboard/index',
        label: '仪表板',
        mobileLabel: '首页',
        icon: 'dashboard',
        uiIcon: 'liquid-icon--data-analysis'
      }
    ]
  },
  {
    label: '管理',
    items: [
      {
        path: '/account-manage/account-list',
        label: '账号管理',
        mobileLabel: '账号',
        icon: 'account',
        uiIcon: 'liquid-icon--user',
        roles: ['sysadmin', 'admin']
      },
      {
        path: '/node-manage/node-list',
        label: '节点管理',
        mobileLabel: '节点',
        icon: 'node',
        uiIcon: 'liquid-icon--connection'
      },
      {
        path: '/server-manage/server-list',
        label: '服务器',
        mobileLabel: '服务器',
        icon: 'server',
        uiIcon: 'liquid-icon--monitor',
        roles: ['sysadmin', 'admin']
      },
      {
        path: '/server-manage/kernel-upgrade',
        label: '内核升级',
        mobileLabel: '内核',
        icon: 'sysinfo',
        uiIcon: 'liquid-icon--cpu',
        roles: ['sysadmin']
      }
    ]
  },
  {
    label: '运维',
    items: [
      {
        path: '/taskManage/task-list',
        label: '文件任务',
        mobileLabel: '任务',
        icon: 'task',
        uiIcon: 'liquid-icon--tickets',
        roles: ['sysadmin']
      },
      {
        path: '/emailManage/email-record',
        label: '邮件记录',
        mobileLabel: '邮件',
        icon: 'email',
        uiIcon: 'liquid-icon--message',
        roles: ['sysadmin', 'admin']
      },
      {
        path: '/system/black-list',
        label: '黑名单',
        mobileLabel: '黑名单',
        icon: 'pass',
        uiIcon: 'liquid-icon--circle-close',
        roles: ['sysadmin']
      }
    ]
  },
  {
    label: '系统',
    items: [
      {
        path: '/system/base-config',
        label: '系统配置',
        mobileLabel: '设置',
        icon: 'system',
        uiIcon: 'liquid-icon--setting',
        roles: ['sysadmin']
      },
      {
        path: '/modify/index',
        label: '个人资料',
        mobileLabel: '我的',
        icon: 'username',
        uiIcon: 'liquid-icon--user'
      }
    ]
  }
]

const USER_GROUPS = [
  {
    label: '我的',
    items: [
      {
        path: '/dashboard/index',
        label: '我的首页',
        mobileLabel: '首页',
        icon: 'dashboard',
        uiIcon: 'liquid-icon--data-analysis'
      },
      {
        path: '/node-manage/node-list',
        label: '我的节点',
        mobileLabel: '节点',
        icon: 'node',
        uiIcon: 'liquid-icon--connection'
      },
      {
        path: '/modify/index',
        label: '个人资料',
        mobileLabel: '我的',
        icon: 'username',
        uiIcon: 'liquid-icon--user'
      }
    ]
  }
]

const TITLES = {
  '/dashboard/index': '仪表板',
  '/account-manage/account-list': '账号管理',
  '/node-manage/node-list': '节点管理',
  '/server-manage/server-list': '服务器管理',
  '/server-manage/server-detail': '服务器详情',
  '/server-manage/kernel-upgrade': '内核升级',
  '/taskManage/task-list': '文件任务',
  '/emailManage/email-record': '邮件记录',
  '/system/black-list': '黑名单',
  '/system/base-config': '系统配置',
  '/modify/index': '个人资料'
}

export default {
  name: 'PrototypeLayout',
  components: {
    AppMain,
    LiquidThemeToggle,
    LiquidNavIcon
  },
  computed: {
    ...mapGetters(['roles', 'username']),
    isAdmin() {
      return this.roles.some((role) => role === 'sysadmin' || role === 'admin')
    },
    isLocalPreview() {
      return process.env.NODE_ENV === 'development' &&
        ['127.0.0.1', 'localhost'].includes(window.location.hostname)
    },
    visibleGroups() {
      const groups = this.isAdmin ? ADMIN_GROUPS : USER_GROUPS
      return groups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              !item.roles ||
              item.roles.some((role) => this.roles.includes(role))
          )
        }))
        .filter((group) => group.items.length)
    },
    flatItems() {
      return this.visibleGroups.reduce(
        (items, group) => items.concat(group.items),
        []
      )
    },
    mobileItems() {
      return this.flatItems
    },
    activePath() {
      return this.$route.path
    },
    pageTitle() {
      if (!this.isAdmin && this.activePath === '/dashboard/index')
        return '我的首页'
      if (!this.isAdmin && this.activePath === '/node-manage/node-list')
        return '我的节点'
      return (
        TITLES[this.activePath] || this.$t(`route.${this.$route.meta.title}`)
      )
    },
    initials() {
      return (this.username || 'TP').slice(0, 2).toUpperCase()
    },
    roleLabel() {
      if (this.roles.includes('sysadmin')) return '超级管理员'
      if (this.roles.includes('admin')) return '管理员'
      return '普通用户'
    }
  },
  watch: {
    activePath() {
      this.$nextTick(this.revealActiveMobileItem)
    }
  },
  mounted() {
    this.revealActiveMobileItem()
  },
  methods: {
    revealActiveMobileItem() {
      const nav = this.$refs.mobileNav
      const items = this.$refs.mobileNavItems || []
      if (!nav || !items.length || nav.scrollWidth <= nav.clientWidth) return
      const activeIndex = this.mobileItems.findIndex(
        (item) => item.path === this.activePath
      )
      const activeItem = items[activeIndex]
      if (!activeItem) return
      const targetLeft =
        activeItem.offsetLeft - (nav.clientWidth - activeItem.offsetWidth) / 2
      nav.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth'
      })
    },
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

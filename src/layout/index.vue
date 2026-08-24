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
              <i class="el-icon-switch-button" aria-hidden="true" />
            </button>
          </div>
          <button
            class="prototype-icon-btn prototype-mobile-logout"
            type="button"
            title="退出登录"
            aria-label="退出登录"
            @click="logout"
          >
            <i class="el-icon-switch-button" aria-hidden="true" />
          </button>
        </div>
      </header>
      <section class="prototype-content"><app-main /></section>
    </main>

    <nav class="prototype-mobile-nav glass raised">
      <button
        v-for="item in mobileItems"
        :key="item.path"
        :class="{ on: activePath === item.path }"
        type="button"
        @click="go(item.path)"
      >
        <i :class="['prototype-menu-icon', item.uiIcon]" aria-hidden="true" />
        <span>{{ item.mobileLabel || item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { AppMain } from './components'
import LiquidThemeToggle from '@/components/LiquidThemeToggle'

const ADMIN_GROUPS = [
  {
    label: '概览',
    items: [
      {
        path: '/dashboard/index',
        label: '仪表板',
        mobileLabel: '首页',
        icon: 'dashboard',
        uiIcon: 'el-icon-data-analysis'
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
        uiIcon: 'el-icon-user',
        roles: ['sysadmin', 'admin']
      },
      {
        path: '/node-manage/node-list',
        label: '节点管理',
        mobileLabel: '节点',
        icon: 'node',
        uiIcon: 'el-icon-connection'
      },
      {
        path: '/server-manage/server-list',
        label: '服务器',
        mobileLabel: '服务器',
        icon: 'server',
        uiIcon: 'el-icon-monitor',
        roles: ['sysadmin', 'admin']
      },
      {
        path: '/server-manage/kernel-upgrade',
        label: '内核升级',
        mobileLabel: '内核',
        icon: 'sysinfo',
        uiIcon: 'el-icon-cpu',
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
        icon: 'task',
        uiIcon: 'el-icon-tickets',
        roles: ['sysadmin']
      },
      {
        path: '/emailManage/email-record',
        label: '邮件记录',
        icon: 'email',
        uiIcon: 'el-icon-message',
        roles: ['sysadmin', 'admin']
      },
      {
        path: '/system/black-list',
        label: '黑名单',
        icon: 'pass',
        uiIcon: 'el-icon-circle-close',
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
        icon: 'system',
        uiIcon: 'el-icon-setting',
        roles: ['sysadmin']
      },
      {
        path: '/modify/index',
        label: '个人资料',
        icon: 'username',
        uiIcon: 'el-icon-user'
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
        uiIcon: 'el-icon-data-analysis'
      },
      {
        path: '/node-manage/node-list',
        label: '我的节点',
        mobileLabel: '节点',
        icon: 'node',
        uiIcon: 'el-icon-connection'
      },
      {
        path: '/modify/index',
        label: '个人资料',
        mobileLabel: '我的',
        icon: 'username',
        uiIcon: 'el-icon-user'
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
  components: { AppMain, LiquidThemeToggle },
  computed: {
    ...mapGetters(['roles', 'username']),
    isAdmin() {
      return this.roles.some((role) => role === 'sysadmin' || role === 'admin')
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
      const paths = this.isAdmin
        ? [
            '/dashboard/index',
            '/account-manage/account-list',
            '/node-manage/node-list',
            '/server-manage/server-list',
            '/modify/index'
          ]
        : ['/dashboard/index', '/node-manage/node-list', '/modify/index']
      return paths
        .map((path) => this.flatItems.find((item) => item.path === path))
        .filter(Boolean)
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
  methods: {
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

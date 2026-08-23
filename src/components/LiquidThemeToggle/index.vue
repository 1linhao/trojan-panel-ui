<template>
  <button
    type="button"
    class="liquid-theme-toggle"
    :aria-label="theme === 'dark' ? '切换浅色模式' : '切换深色模式'"
    :title="theme === 'dark' ? '切换浅色模式' : '切换深色模式'"
    @click="handleToggle"
  >
    <span aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span>
  </button>
</template>

<script>
import { getInitialTheme, toggleTheme } from '@/utils/theme'

export default {
  name: 'LiquidThemeToggle',
  data() {
    return {
      theme: getInitialTheme()
    }
  },
  methods: {
    handleToggle() {
      this.theme = toggleTheme()
    }
  }
}
</script>

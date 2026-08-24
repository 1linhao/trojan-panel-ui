<template>
  <button
    type="button"
    class="liquid-theme-toggle"
    :aria-label="theme === 'dark' ? '切换浅色模式' : '切换深色模式'"
    :title="theme === 'dark' ? '切换浅色模式' : '切换深色模式'"
    @click="handleToggle"
  >
    <svg
      v-if="theme === 'light'"
      class="theme-icon theme-icon--sun"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" />
      <path d="m5.3 5.3 1.4 1.4m10.6 10.6 1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </svg>
    <svg
      v-else
      class="theme-icon theme-icon--moon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8a8.5 8.5 0 1 0 11.4 11.4Z" />
    </svg>
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

<style scoped>
.theme-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.theme-icon--moon {
  stroke-width: 1.85;
}
</style>

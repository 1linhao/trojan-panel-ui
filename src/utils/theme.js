const THEME_KEY = 'trojan-panel-color-scheme'

export function applyTheme(theme) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', nextTheme)
  return nextTheme
}

export function getInitialTheme() {
  const runtimeTheme = document.documentElement.getAttribute('data-theme')
  if (runtimeTheme === 'dark' || runtimeTheme === 'light') return runtimeTheme
  return window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function initializeTheme() {
  // 旧版本曾将主题写入本地；新逻辑只在当前运行周期内保留手动选择。
  localStorage.removeItem(THEME_KEY)
  const browserTheme = window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
  return applyTheme(browserTheme)
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  return applyTheme(currentTheme === 'dark' ? 'light' : 'dark')
}

const THEME_KEY = 'trojan-panel-color-scheme'

export function applyTheme(theme) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', nextTheme)
  localStorage.setItem(THEME_KEY, nextTheme)
  return nextTheme
}

export function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme
  return window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function initializeTheme() {
  return applyTheme(getInitialTheme())
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  return applyTheme(currentTheme === 'dark' ? 'light' : 'dark')
}

const THEME_KEY = 'trojan-panel-color-scheme'
const MODES = ['light', 'dark']
export const COLOR_PALETTES = ['blue', 'violet', 'emerald', 'amber']

function normalizeMode(mode) {
  return MODES.includes(mode) ? mode : 'light'
}

function normalizePalette(palette) {
  return COLOR_PALETTES.includes(palette) ? palette : 'blue'
}

export function getThemeState() {
  return {
    mode: normalizeMode(document.documentElement.getAttribute('data-theme')),
    palette: normalizePalette(
      document.documentElement.getAttribute('data-palette')
    )
  }
}

export function applyTheme({ mode, palette } = {}) {
  const current = getThemeState()
  const next = {
    mode: normalizeMode(mode || current.mode),
    palette: normalizePalette(palette || current.palette)
  }
  document.documentElement.setAttribute('data-theme', next.mode)
  document.documentElement.setAttribute('data-palette', next.palette)
  return next
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
  return applyTheme({ mode: browserTheme, palette: 'blue' })
}

export function toggleTheme() {
  const current = getThemeState()
  return applyTheme({ mode: current.mode === 'dark' ? 'light' : 'dark' })
}

export function applyPalette(palette) {
  return applyTheme({ palette })
}

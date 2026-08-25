const THEME_KEY = 'trojan-panel-color-scheme'
const PALETTE_KEY = 'trojan-panel-color-palette'
const MODES = ['light', 'dark']
export const COLOR_PALETTES = ['blue', 'violet', 'emerald', 'amber']
const BROWSER_THEME_COLORS = {
  light: {
    blue: '#0a7cff',
    violet: '#8155e7',
    emerald: '#078b6c',
    amber: '#cf7100'
  },
  dark: {
    blue: '#3f9bff',
    violet: '#a98bff',
    emerald: '#45d4ad',
    amber: '#ffad42'
  }
}

let systemThemeMedia

function normalizeMode(mode) {
  return MODES.includes(mode) ? mode : 'light'
}

function normalizePalette(palette) {
  return COLOR_PALETTES.includes(palette) ? palette : 'blue'
}

function updateBrowserThemeColor({ mode, palette }) {
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', BROWSER_THEME_COLORS[mode][palette])
}

function notifyThemeChange(theme) {
  if (typeof window.CustomEvent !== 'function') return
  window.dispatchEvent(new CustomEvent('trojan-theme-change', { detail: theme }))
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
  updateBrowserThemeColor(next)
  notifyThemeChange(next)
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
  // 明暗模式只在当前运行周期内保留；颜色主题单独持久化。
  localStorage.removeItem(THEME_KEY)
  systemThemeMedia = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null
  const browserTheme = systemThemeMedia && systemThemeMedia.matches
    ? 'dark'
    : 'light'
  const savedPalette = normalizePalette(localStorage.getItem(PALETTE_KEY))
  const initialTheme = applyTheme({ mode: browserTheme, palette: savedPalette })

  if (systemThemeMedia) {
    const handleSystemThemeChange = event => {
      applyTheme({ mode: event.matches ? 'dark' : 'light' })
    }
    if (systemThemeMedia.addEventListener) {
      systemThemeMedia.addEventListener('change', handleSystemThemeChange)
    } else if (systemThemeMedia.addListener) {
      systemThemeMedia.addListener(handleSystemThemeChange)
    }
  }

  return initialTheme
}

export function toggleTheme() {
  const current = getThemeState()
  return applyTheme({ mode: current.mode === 'dark' ? 'light' : 'dark' })
}

export function applyPalette(palette) {
  const next = applyTheme({ palette })
  localStorage.setItem(PALETTE_KEY, next.palette)
  return next
}

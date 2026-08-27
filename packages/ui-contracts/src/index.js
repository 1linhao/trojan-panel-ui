export const SURFACES = Object.freeze([
  'canvas',
  'panel',
  'raised',
  'overlay',
  'control',
  'navigation'
])
export const TONES = Object.freeze([
  'neutral',
  'accent',
  'success',
  'warning',
  'danger',
  'info'
])
export const SIZES = Object.freeze(['sm', 'md', 'lg'])
export const DENSITIES = Object.freeze(['compact', 'comfortable', 'spacious'])
export const STATES = Object.freeze([
  'idle',
  'hover',
  'active',
  'selected',
  'disabled',
  'loading',
  'invalid'
])
export const THEME_MODES = Object.freeze(['system', 'light', 'dark'])
export const PALETTES = Object.freeze(['blue', 'violet', 'emerald', 'amber'])
export const MOTION_MODES = Object.freeze(['system', 'full', 'reduced', 'none'])

export const UI_CUSTOM_PROPERTIES = Object.freeze([
  '--ui-canvas-bg',
  '--ui-surface-bg',
  '--ui-surface-border',
  '--ui-surface-shadow',
  '--ui-surface-backdrop',
  '--ui-ink',
  '--ui-ink-muted',
  '--ui-accent',
  '--ui-on-accent',
  '--ui-focus-ring',
  '--ui-control-bg',
  '--ui-control-border',
  '--ui-control-height',
  '--ui-radius-sm',
  '--ui-radius-md',
  '--ui-radius-lg',
  '--ui-space-1',
  '--ui-space-2',
  '--ui-space-3',
  '--ui-space-4',
  '--ui-space-5',
  '--ui-space-6',
  '--ui-space-7',
  '--ui-space-8',
  '--ui-motion-fast',
  '--ui-motion-normal',
  '--ui-motion-slow',
  '--ui-motion-easing-standard',
  '--ui-motion-easing-emphasized',
  '--ui-motion-distance-sm',
  '--ui-motion-distance-md',
  '--ui-overlay-z'
])

export function assertEnumValue(name, value, values) {
  if (!values.includes(value)) {
    throw new TypeError(`${name} must be one of: ${values.join(', ')}`)
  }
  return value
}

export const validateSurface = (value) =>
  assertEnumValue('surface', value, SURFACES)
export const validateTone = (value) => assertEnumValue('tone', value, TONES)
export const validateSize = (value) => assertEnumValue('size', value, SIZES)
export const validateDensity = (value) =>
  assertEnumValue('density', value, DENSITIES)
export const validateState = (value) => assertEnumValue('state', value, STATES)

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value))
    return value
  Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

function normalizeItem(item, groupKey, itemKey) {
  if (!item || typeof item !== 'object')
    throw new TypeError('shell item must be an object')
  if (!item[itemKey]) throw new TypeError(`shell item requires ${itemKey}`)
  return {
    key: String(item[itemKey]),
    label: String(item.label || item[itemKey]),
    mobileLabel: String(item.mobileLabel || item.label || item[itemKey]),
    icon: item.icon ? String(item.icon) : '',
    disabled: Boolean(item.disabled),
    meta: item.meta ? { ...item.meta } : {},
    groupKey
  }
}

export function createShellModel(input = {}) {
  const groupKey = input.groupKey || 'key'
  const itemKey = input.itemKey || 'key'
  const seenGroups = new Set()
  const seenItems = new Set()
  const groups = (input.groups || []).map((group) => {
    if (!group || !group[groupKey])
      throw new TypeError(`shell group requires ${groupKey}`)
    const key = String(group[groupKey])
    if (seenGroups.has(key))
      throw new TypeError(`duplicate shell group key: ${key}`)
    seenGroups.add(key)
    const items = (group.items || []).map((item) => {
      const normalized = normalizeItem(item, key, itemKey)
      if (seenItems.has(normalized.key))
        throw new TypeError(`duplicate shell item key: ${normalized.key}`)
      seenItems.add(normalized.key)
      return normalized
    })
    return { key, label: String(group.label || key), items }
  })
  return deepFreeze({
    brand: {
      name: String(input.brand?.name || ''),
      subtitle: String(input.brand?.subtitle || ''),
      mark: String(input.brand?.mark || '')
    },
    activeKey: input.activeKey == null ? '' : String(input.activeKey),
    pageTitle: String(input.pageTitle || ''),
    user: input.user ? { ...input.user } : null,
    groups
  })
}

function normalizeTheme(theme = {}, systemMode = 'light') {
  const mode = assertEnumValue(
    'theme.mode',
    theme.mode || 'system',
    THEME_MODES
  )
  const palette = assertEnumValue(
    'theme.palette',
    theme.palette || 'blue',
    PALETTES
  )
  return Object.freeze({
    mode,
    palette,
    resolvedMode: mode === 'system' ? systemMode : mode
  })
}

function normalizeMotion(motion = {}, systemReduced = false) {
  const mode = assertEnumValue(
    'motion.mode',
    motion.mode || 'system',
    MOTION_MODES
  )
  return Object.freeze({
    mode,
    resolvedMode:
      mode === 'system' ? (systemReduced ? 'reduced' : 'full') : mode
  })
}

export function createUiRuntime({
  material,
  motion,
  initialTheme,
  initialMotion,
  environment = {}
} = {}) {
  if (
    !material ||
    typeof material.apply !== 'function' ||
    typeof material.getCapabilities !== 'function'
  ) {
    throw new TypeError('material must implement apply() and getCapabilities()')
  }
  const getSystemMode = environment.getSystemMode || (() => 'light')
  const getReducedMotion = environment.getReducedMotion || (() => false)
  const listeners = new Set()
  const motionListeners = new Set()
  let state = normalizeTheme(initialTheme, getSystemMode())
  let motionState = normalizeMotion(initialMotion, getReducedMotion())
  let releaseSystemSubscription = null
  let releaseMotionSubscription = null

  const apply = () => {
    material.apply(state)
    listeners.forEach((listener) => listener(state))
    return state
  }
  const setTheme = (patch) => {
    state = normalizeTheme({ ...state, ...patch }, getSystemMode())
    return apply()
  }
  const applyMotion = () => {
    if (motion && typeof motion.apply === 'function') motion.apply(motionState)
    motionListeners.forEach((listener) => listener(motionState))
    return motionState
  }
  const setMotion = (patch) => {
    motionState = normalizeMotion(
      { ...motionState, ...patch },
      getReducedMotion()
    )
    return applyMotion()
  }
  if (typeof environment.subscribeSystemMode === 'function') {
    releaseSystemSubscription = environment.subscribeSystemMode((mode) => {
      if (state.mode === 'system')
        setTheme({ mode: 'system', resolvedMode: mode })
    })
  }
  if (typeof environment.subscribeReducedMotion === 'function') {
    releaseMotionSubscription = environment.subscribeReducedMotion(() => {
      if (motionState.mode === 'system') setMotion({ mode: 'system' })
    })
  }
  apply()
  applyMotion()

  return Object.freeze({
    theme: Object.freeze({
      getState: () => state,
      setMode: (mode) => setTheme({ mode }),
      setPalette: (palette) => setTheme({ palette }),
      subscribe(listener) {
        if (typeof listener !== 'function')
          throw new TypeError('listener must be a function')
        listeners.add(listener)
        return () => listeners.delete(listener)
      }
    }),
    material: Object.freeze({
      getCapabilities: () => deepFreeze({ ...material.getCapabilities() })
    }),
    motion: Object.freeze({
      getState: () => motionState,
      setMode: (mode) => setMotion({ mode }),
      getCapabilities: () =>
        deepFreeze({
          ...(motion?.getCapabilities?.() || { available: false })
        }),
      subscribe(listener) {
        if (typeof listener !== 'function')
          throw new TypeError('listener must be a function')
        motionListeners.add(listener)
        return () => motionListeners.delete(listener)
      }
    }),
    destroy() {
      listeners.clear()
      motionListeners.clear()
      if (typeof releaseSystemSubscription === 'function')
        releaseSystemSubscription()
      if (typeof releaseMotionSubscription === 'function')
        releaseMotionSubscription()
      releaseSystemSubscription = null
      releaseMotionSubscription = null
    }
  })
}

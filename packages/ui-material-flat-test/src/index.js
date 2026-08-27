/* eslint-env browser, es2021 */

export function createFlatTestMaterial({ root } = {}) {
  const target = root || globalThis.document?.documentElement
  return Object.freeze({
    apply(state) {
      if (target) {
        target.setAttribute('data-ui-material', 'flat-test')
        target.setAttribute('data-theme', state.resolvedMode)
        target.setAttribute('data-palette', state.palette)
      }
      return state
    },
    getCapabilities() {
      return Object.freeze({
        backdropFilter: false,
        colorScheme: true,
        palettes: Object.freeze(['blue', 'violet', 'emerald', 'amber']),
        modes: Object.freeze(['light', 'dark'])
      })
    }
  })
}

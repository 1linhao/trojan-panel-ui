/* eslint-env browser, es2021 */

export function createNativeMotion({ root } = {}) {
  const target = root || globalThis.document?.documentElement
  return Object.freeze({
    apply(state) {
      if (target) target.setAttribute('data-ui-motion', state.resolvedMode)
      return state
    },
    getCapabilities() {
      return Object.freeze({
        available: Boolean(target),
        reducedMotion: Boolean(
          globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ),
        viewTransitions: Boolean(globalThis.document?.startViewTransition)
      })
    }
  })
}

export function createMotionEnvironment(scope = globalThis) {
  const media = scope.matchMedia?.('(prefers-reduced-motion: reduce)')
  return Object.freeze({
    getReducedMotion: () => Boolean(media?.matches),
    subscribeReducedMotion(listener) {
      if (!media) return () => {}
      const handler = () => listener(Boolean(media.matches))
      media.addEventListener?.('change', handler)
      return () => media.removeEventListener?.('change', handler)
    }
  })
}

/* eslint-env browser, es2021 */

export const BUTTON_INTERACTION = Object.freeze({
  selector: 'button, [role="button"]',
  attribute: 'data-ui-interaction',
  variant: 'nav-lift'
})

function collectInteractiveButtons(node, selector) {
  if (!node || typeof node !== 'object') return []
  const matches = node.matches?.(selector) ? [node] : []
  const descendants = node.querySelectorAll?.(selector) || []
  return [...matches, ...descendants]
}

/**
 * Default Adapter for the button-interaction Interface. Alternative animation
 * engines can implement the same connect/disconnect/destroy methods.
 */
export function createCssButtonInteractionAdapter({
  attribute = BUTTON_INTERACTION.attribute,
  variant = BUTTON_INTERACTION.variant
} = {}) {
  const owned = new WeakSet()
  return Object.freeze({
    connect(element) {
      if (!element?.hasAttribute?.(attribute)) {
        element.setAttribute(attribute, variant)
        owned.add(element)
      }
    },
    disconnect(element) {
      if (owned.has(element)) {
        element.removeAttribute(attribute)
        owned.delete(element)
      }
    },
    destroy() {}
  })
}

/**
 * Owns discovery and lifecycle only. Visual behavior belongs to an injected
 * Adapter, keeping the production DOM independent from a particular engine.
 */
export function createButtonInteractionController({
  root = globalThis.document,
  selector = BUTTON_INTERACTION.selector,
  adapter = createCssButtonInteractionAdapter(),
  observerFactory = (callback) => new MutationObserver(callback)
} = {}) {
  let observer = null
  let mounted = false

  const connectTree = (node) =>
    collectInteractiveButtons(node, selector).forEach(adapter.connect)
  const disconnectTree = (node) =>
    collectInteractiveButtons(node, selector).forEach(adapter.disconnect)

  return Object.freeze({
    mount() {
      if (mounted || !root) return this
      mounted = true
      connectTree(root)
      if (typeof observerFactory === 'function') {
        observer = observerFactory((records) => {
          records.forEach((record) => {
            record.removedNodes?.forEach(disconnectTree)
            record.addedNodes?.forEach(connectTree)
          })
        })
        observer?.observe?.(root, { childList: true, subtree: true })
      }
      return this
    },
    refresh() {
      if (root) connectTree(root)
      return this
    },
    destroy() {
      if (!mounted) return
      observer?.disconnect?.()
      disconnectTree(root)
      adapter.destroy?.()
      observer = null
      mounted = false
    }
  })
}

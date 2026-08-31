import test from 'node:test'
import assert from 'node:assert/strict'
import { acquireOverlay } from '../../src/overlay-stack.js'
import { UiDialog } from '../../src/index.js'

function fixture() {
  const listeners = {}
  const doc = {
    body: { style: { overflow: 'auto' } },
    addEventListener: (name, handler) => { listeners[name] = handler },
    removeEventListener: (name) => { delete listeners[name] }
  }
  const node = (children = []) => {
    const element = {
      ownerDocument: doc, children, isConnected: true, tabIndex: 0,
      contains(target) { return target === this || children.some((child) => child.contains(target)) },
      querySelectorAll: () => children,
      getClientRects: () => [{}],
      closest: () => null,
      focus() { doc.activeElement = this; listeners.focusin?.({ target: this }) }
    }
    return element
  }
  const key = (key, shiftKey = false, prevented = false) => {
    const event = { key, shiftKey, defaultPrevented: prevented, preventDefault() { this.defaultPrevented = true } }
    listeners.keydown?.(event)
    return event
  }
  return { doc, node, key, listeners }
}

test('nested overlays own Escape, trap Tab, lock scroll, and restore focus in order', () => {
  const { doc, node, key, listeners } = fixture()
  const launch = node(), first = node(), last = node(), dialog = node([first, last])
  launch.focus()
  let outerClosed = 0, innerClosed = 0
  const release = acquireOverlay(dialog, { close: () => outerClosed++ })
  assert.equal(doc.body.style.overflow, 'hidden')
  dialog.focus()
  key('Tab')
  assert.equal(doc.activeElement, first)
  key('Tab', true)
  assert.equal(doc.activeElement, last)
  key('Tab')
  assert.equal(doc.activeElement, first)
  const inner = node()
  const releaseInner = acquireOverlay(inner, { close: () => innerClosed++ })
  inner.focus()
  key('Escape')
  assert.equal(innerClosed, 1)
  assert.equal(outerClosed, 0)
  key('Escape', false, true)
  assert.equal(innerClosed, 1)
  releaseInner()
  assert.equal(doc.activeElement, first)
  assert.equal(doc.body.style.overflow, 'hidden')
  release()
  release()
  assert.equal(doc.activeElement, launch)
  assert.equal(doc.body.style.overflow, 'auto')
  assert.deepEqual(listeners, {})
})

test('destroying a lower overlay does not steal focus or lose the external return target', () => {
  const { doc, node } = fixture()
  const launch = node(), first = node(), outer = node([first]), inner = node()
  launch.focus()
  const releaseOuter = acquireOverlay(outer)
  first.focus()
  const releaseInner = acquireOverlay(inner)
  inner.focus()
  releaseOuter()
  assert.equal(doc.activeElement, inner)
  releaseInner()
  assert.equal(doc.activeElement, launch)
  assert.equal(doc.body.style.overflow, 'auto')
})

test('Escape opt-out and focus escaping the modal are respected', () => {
  const { doc, node, key } = fixture()
  const outside = node(), dialog = node()
  outside.focus()
  const release = acquireOverlay(dialog, { closeOnEscape: false, close: () => assert.fail('closed') })
  outside.focus()
  assert.equal(doc.activeElement, dialog)
  assert.equal(key('Escape').defaultPrevented, false)
  assert.equal(key('Tab').defaultPrevented, true)
  release()
})

test('dialog teardown removes a body portal even when parent is destroyed while visible', () => {
  const calls = []
  UiDialog.beforeDestroy.call({
    appendToBody: true,
    $el: { nodeType: 1, remove: () => calls.push('remove') },
    restoreFocus: () => calls.push('release')
  })
  assert.deepEqual(calls, ['release', 'remove'])
  UiDialog.beforeDestroy.call({
    appendToBody: false,
    $el: { nodeType: 1, remove: () => assert.fail('non-portal') },
    restoreFocus() {}
  })
})

test('opening then hiding before nextTick cannot register an invisible overlay', () => {
  let tick
  const instance = { visible: true, $nextTick: (callback) => { tick = callback } }
  UiDialog.methods.open.call(instance)
  instance.visible = false
  tick()
  assert.equal(instance._releaseOverlay, undefined)
})

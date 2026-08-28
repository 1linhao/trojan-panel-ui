import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  COMPONENTS,
  BUTTON_INTERACTION,
  UiButton,
  UiInput,
  createButtonInteractionController,
  createCssButtonInteractionAdapter,
  createVue2Components
} from '../../src/index.js'

test('exports named components and selective plugin registration', () => {
  const names = []
  createVue2Components({ include: ['UiButton'] }).install({
    component: (name) => names.push(name)
  })
  assert.deepEqual(names, ['UiButton'])
  assert.deepEqual(Object.keys(COMPONENTS), ['UiButton', 'UiInput'])
  assert.throws(
    () => createVue2Components({ include: ['Missing'] }),
    /Unknown UI components/
  )
})

test('button anatomy exposes semantic attributes and loading behavior', () => {
  const emitted = []
  const vnode = UiButton.render.call(
    {
      tone: 'accent',
      surface: 'control',
      size: 'md',
      disabled: false,
      loading: true,
      type: 'button',
      $attrs: {},
      $listeners: {},
      $slots: { default: ['Save'] },
      $scopedSlots: {},
      $emit: (...args) => emitted.push(args)
    },
    (tag, data, children) => ({ tag, data, children })
  )
  assert.equal(vnode.tag, 'button')
  assert.equal(vnode.data.attrs['data-ui-state'], 'loading')
  assert.equal(vnode.data.attrs['aria-busy'], 'true')
  assert.equal(
    vnode.data.attrs[BUTTON_INTERACTION.attribute],
    BUTTON_INTERACTION.variant
  )
  vnode.data.on.click({})
  assert.equal(emitted.length, 0)
})

test('button controller connects current and dynamically added controls', () => {
  const createElement = (matches = true, descendants = []) => {
    const attributes = new Map()
    return {
      matches: () => matches,
      querySelectorAll: () => descendants,
      hasAttribute: (name) => attributes.has(name),
      setAttribute: (name, value) => attributes.set(name, value),
      removeAttribute: (name) => attributes.delete(name),
      getAttribute: (name) => attributes.get(name)
    }
  }
  const existing = createElement()
  const root = createElement(false, [existing])
  let mutationCallback
  let disconnected = false
  const controller = createButtonInteractionController({
    root,
    adapter: createCssButtonInteractionAdapter(),
    observerFactory: (callback) => {
      mutationCallback = callback
      return {
        observe() {},
        disconnect: () => {
          disconnected = true
        }
      }
    }
  })

  controller.mount()
  assert.equal(existing.getAttribute('data-ui-interaction'), 'nav-lift')

  const added = createElement()
  mutationCallback([{ addedNodes: [added], removedNodes: [] }])
  assert.equal(added.getAttribute('data-ui-interaction'), 'nav-lift')

  controller.destroy()
  assert.equal(existing.getAttribute('data-ui-interaction'), undefined)
  assert.equal(disconnected, true)
})

test('button controller preserves an explicit animation Adapter choice', () => {
  const attributes = new Map([['data-ui-interaction', 'none']])
  const control = {
    matches: () => true,
    querySelectorAll: () => [],
    hasAttribute: (name) => attributes.has(name),
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name)
  }
  createButtonInteractionController({
    root: control,
    observerFactory: null
  }).mount()
  assert.equal(attributes.get('data-ui-interaction'), 'none')
})

test('shared button CSS matches the navigation hover interaction contract', async () => {
  const css = await readFile(
    new URL('../../src/button-interactions.css', import.meta.url),
    'utf8'
  )
  assert.match(css, /--ui-button-hover-lift:\s*-3px/)
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/)
  assert.match(css, /\[data-ui-interaction='nav-lift'\].*:hover/s)
  assert.match(css, /:not\(:disabled\).*\[aria-disabled='true'\]/s)
  assert.match(css, /transform:\s*translateY\(var\(--ui-button-hover-lift\)\)/)
  assert.match(css, /--ui-button-interaction-shadow/)
  assert.match(css, /--ui-surface-shadow, none/)
  assert.match(css, /data-ui-motion='reduced'/)
})

test('input emits Vue 2 v-model input events', () => {
  const emitted = []
  const vnode = UiInput.render.call(
    {
      value: 'old',
      tone: 'neutral',
      size: 'md',
      disabled: false,
      invalid: false,
      $attrs: {},
      $listeners: {},
      $emit: (...args) => emitted.push(args)
    },
    (tag, data) => ({ tag, data })
  )
  vnode.data.on.input({ target: { value: 'new' } })
  assert.deepEqual(emitted, [['input', 'new']])
})

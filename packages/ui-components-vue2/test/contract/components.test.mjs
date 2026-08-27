import test from 'node:test'
import assert from 'node:assert/strict'
import {
  COMPONENTS,
  UiButton,
  UiInput,
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
  vnode.data.on.click({})
  assert.equal(emitted.length, 0)
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

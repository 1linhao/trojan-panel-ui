import test from 'node:test'
import assert from 'node:assert/strict'
import { UiAppShell, createAppShell } from '../../src/index.js'

test('shell plugin registers only the public shell', () => {
  const names = []
  createAppShell().install({ component: (name) => names.push(name) })
  assert.deepEqual(names, ['UiAppShell'])
})

test('shell emits navigation intent without router knowledge', () => {
  const emitted = []
  const component = {
    model: {
      brand: { mark: 'T', name: 'Test', subtitle: 'Lab' },
      activeKey: '/home',
      pageTitle: 'Home',
      user: null,
      groups: [
        {
          key: 'main',
          label: 'Main',
          items: [
            { key: '/home', label: 'Home', mobileLabel: 'Home', icon: '' }
          ]
        }
      ]
    },
    $slots: {},
    $scopedSlots: {},
    $emit: (...args) => emitted.push(args)
  }
  const h = (tag, data, children) => ({
    tag,
    data: data || {},
    children: children || []
  })
  const vnode = UiAppShell.render.call(component, h)
  const aside = vnode.children[0]
  const nav = aside.children.find((child) =>
    child?.data?.class?.includes?.('tp-ui-shell__nav-item')
  )
  nav.data.on.click()
  assert.equal(emitted[0][0], 'navigate')
  assert.equal(emitted[0][1], '/home')
})

test('shell source has no business framework imports', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../../src/index.js', import.meta.url), 'utf8')
  )
  assert.doesNotMatch(source, /vuex|vue-router|router|store|token|roles/i)
})

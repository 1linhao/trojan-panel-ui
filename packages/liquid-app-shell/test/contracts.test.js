import assert from 'node:assert/strict'
import test from 'node:test'
import { flattenNavigation, normalizeShellModel } from '../src/contracts.js'

const model = {
  brand: { name: 'Example', mark: 'E' },
  title: 'Home',
  activeKey: 'home',
  navGroups: [{ key: 'main', label: 'Main', items: [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'profile', label: 'Profile', mobileLabel: 'Me' }
  ] }],
  mobileKeys: ['home', 'missing', 'profile'],
  user: { name: 'Ada' }
}

test('normalizes one model for desktop and mobile navigation', () => {
  const result = normalizeShellModel(model)
  assert.deepEqual(flattenNavigation(result).map((item) => item.key), ['home', 'profile'])
  assert.deepEqual(result.mobileKeys, ['home', 'profile'])
  assert.equal(result.user.initials, 'AD')
})

test('rejects ambiguous navigation keys', () => {
  assert.throws(() => normalizeShellModel({ navGroups: [
    { key: 'a', items: [{ key: 'same', label: 'One' }] },
    { key: 'b', items: [{ key: 'same', label: 'Two' }] }
  ] }), /Duplicate navigation item key/)
})

test('model output contains no permissions or navigation effects', () => {
  const result = normalizeShellModel(model)
  assert.equal('roles' in result, false)
  assert.equal('routes' in result, false)
  assert.equal('logout' in result, false)
})

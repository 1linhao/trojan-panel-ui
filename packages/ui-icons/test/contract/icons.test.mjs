import test from 'node:test'
import assert from 'node:assert/strict'
import { iconNames, renderIcon } from '../../src/index.js'

test('icons use stable semantic names and currentColor', () => {
  const h = (tag, data, children) => ({ tag, data, children })
  const icon = renderIcon(h, 'home')
  assert.ok(iconNames.includes('home'))
  assert.equal(icon.data.attrs.stroke, 'currentColor')
  assert.throws(() => renderIcon(h, 'missing'), /Unknown icon/)
})

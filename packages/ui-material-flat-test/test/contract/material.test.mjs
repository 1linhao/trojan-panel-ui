import test from 'node:test'
import assert from 'node:assert/strict'
import { createFlatTestMaterial } from '../../src/index.js'

test('flat material satisfies the same controller contract', () => {
  const attributes = {}
  const material = createFlatTestMaterial({
    root: {
      setAttribute: (name, value) => {
        attributes[name] = value
      }
    }
  })
  material.apply({ resolvedMode: 'light', palette: 'amber' })
  assert.equal(attributes['data-ui-material'], 'flat-test')
  assert.equal(attributes['data-palette'], 'amber')
  assert.equal(material.getCapabilities().backdropFilter, false)
})

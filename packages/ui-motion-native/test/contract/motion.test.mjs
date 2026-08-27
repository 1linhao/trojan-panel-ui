import test from 'node:test'
import assert from 'node:assert/strict'
import { createNativeMotion } from '../../src/index.js'

test('motion controller applies only a stable semantic mode', () => {
  const attributes = {}
  const controller = createNativeMotion({
    root: {
      setAttribute: (name, value) => {
        attributes[name] = value
      }
    }
  })
  controller.apply({ mode: 'system', resolvedMode: 'reduced' })
  assert.equal(attributes['data-ui-motion'], 'reduced')
  assert.equal(controller.getCapabilities().available, true)
})

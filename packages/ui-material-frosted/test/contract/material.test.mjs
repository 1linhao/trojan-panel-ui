import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createFrostedMaterial } from '../../src/index.js'

test('applies material through stable root attributes', () => {
  const attributes = {}
  const material = createFrostedMaterial({
    root: {
      setAttribute: (name, value) => {
        attributes[name] = value
      }
    },
    document: null
  })
  material.apply({ resolvedMode: 'dark', palette: 'violet' })
  assert.deepEqual(attributes, {
    'data-ui-material': 'frosted',
    'data-theme': 'dark',
    'data-palette': 'violet'
  })
  assert.deepEqual(material.getCapabilities().palettes, [
    'blue',
    'violet',
    'emerald',
    'amber'
  ])
})

test('defines required material tokens, modes, palettes, surfaces, and fallback', async () => {
  const css = await readFile(
    new URL('../../src/material.css', import.meta.url),
    'utf8'
  )
  for (const token of [
    '--ui-canvas-bg',
    '--ui-surface-bg',
    '--ui-surface-border',
    '--ui-surface-shadow',
    '--ui-surface-backdrop',
    '--ui-ink',
    '--ui-accent',
    '--ui-control-bg'
  ]) {
    assert.match(css, new RegExp(token))
  }
  for (const value of [
    'dark',
    'violet',
    'emerald',
    'amber',
    'raised',
    'overlay',
    'navigation'
  ])
    assert.match(css, new RegExp(value))
  assert.match(css, /@supports not/)
  assert.doesNotMatch(css, /#app|\.prototype-|\.dashboard-|\.account-/)
})

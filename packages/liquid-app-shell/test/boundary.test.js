import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? sourceFiles(target) : target.endsWith('.js') ? [target] : []
  }))
  return nested.flat()
}

test('shell source has no application infrastructure imports', async () => {
  const files = await sourceFiles(new URL('../src', import.meta.url).pathname)
  const forbidden = [/vuex/i, /vue-router/i, /\$router/, /\$store/, /cookie/i, /token/i, /axios/i, /sysadmin/i]
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    for (const pattern of forbidden) assert.doesNotMatch(source, pattern, `${file} violates the Shell seam`)
  }
})

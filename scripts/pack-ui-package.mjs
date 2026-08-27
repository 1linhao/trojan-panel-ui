import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

const packageDirectory = path.resolve(process.argv[2] || process.cwd())
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'tp-ui-pack-'))
try {
  const manifest = JSON.parse(
    await readFile(path.join(packageDirectory, 'package.json'), 'utf8')
  )
  const result = spawnSync(
    'npm',
    ['pack', '--json', '--pack-destination', temporaryDirectory],
    {
      cwd: packageDirectory,
      encoding: 'utf8'
    }
  )
  if (result.status !== 0) throw new Error(result.stderr || 'npm pack failed')
  const parsed = JSON.parse(result.stdout)
  const packed = Array.isArray(parsed)
    ? parsed[0]
    : parsed[manifest.name] || Object.values(parsed)[0]
  const files = new Set(packed.files.map((entry) => entry.path))
  const exportTargets = Object.values(manifest.exports).flatMap((entry) =>
    typeof entry === 'string'
      ? [entry]
      : Object.values(entry).filter((value) => typeof value === 'string')
  )
  for (const target of exportTargets) {
    const packedPath = target.replace(/^\.\//, '')
    if (!files.has(packedPath))
      throw new Error(`${manifest.name}: packed tarball misses ${packedPath}`)
  }
  process.stdout.write(
    `PASS pack smoke ${manifest.name} (${packed.files.length} files)\n`
  )
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}

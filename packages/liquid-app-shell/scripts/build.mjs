import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { transform } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(path.join(root, 'src'), dist, { recursive: true })

for (const entry of await readdir(dist, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.js')) continue
  const target = path.join(dist, entry.name)
  const source = await readFile(target, 'utf8')
  const result = await transform(source, { loader: 'js', format: 'esm', target: 'es2018', charset: 'utf8' })
  await writeFile(target, result.code)
}

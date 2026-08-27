import { spawnSync } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

function run(command, args, cwd = process.cwd()) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env
  })
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(' ')} 执行失败`)
}

const packageRoot = path.resolve('packages')
const packages = (await readdir(packageRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(packageRoot, entry.name))
  .sort()

for (const packageDirectory of packages) {
  run('npm', ['run', 'check'], packageDirectory)
}
run(process.execPath, ['scripts/check-ui-architecture.mjs'])
run(process.execPath, ['scripts/build-ui-labs.mjs'])
process.stdout.write('PASS composable UI workspace\n')

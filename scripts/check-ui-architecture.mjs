import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const packagesRoot = path.resolve('packages')
const packageNames = (await readdir(packagesRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(fullPath)))
    else files.push(fullPath)
  }
  return files
}

const failures = []
for (const packageName of packageNames) {
  const packageRoot = path.join(packagesRoot, packageName)
  const files = (await walk(path.join(packageRoot, 'src'))).filter((file) =>
    /\.(?:js|css|svg)$/.test(file)
  )
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    if (/#app\b/.test(source)) failures.push(`${file}: 禁止 #app 选择器`)
    if (/!important\b/.test(source)) failures.push(`${file}: 禁止 !important`)
    if (/from\s+['"][^'"]+\/src\//.test(source))
      failures.push(`${file}: 禁止跨包 /src/ 深层导入`)
    if (
      packageName.startsWith('ui-material-') &&
      /\.(?:prototype|account|dashboard|server|node)-/.test(source)
    ) {
      failures.push(`${file}: 材质包包含疑似业务选择器`)
    }
    if (
      !packageName.startsWith('ui-material-') &&
      /#[0-9a-fA-F]{3,8}\b|rgba?\s*\(/.test(source)
    ) {
      failures.push(`${file}: 硬编码色值只能出现在材质包`)
    }
  }
}

if (failures.length) throw new Error(failures.join('\n'))
process.stdout.write(
  `PASS architecture boundaries (${packageNames.length} packages)\n`
)

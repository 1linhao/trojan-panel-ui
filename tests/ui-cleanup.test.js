const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { transformSync } = require('@babel/core')
const compiler = require('vue/compiler-sfc')

const root = path.resolve(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
function loadModule(source, dependencies, globals = {}) {
  const { code } = transformSync(source, {
    babelrc: false, configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
  })
  const exports = {}
  vm.runInNewContext(code, {
    ...globals,
    exports,
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`)
      return dependencies[name]
    }
  })
  return exports
}
const loadBranding = (setting) => loadModule(read('src/utils/panel-branding.js'), {
  vue: { observable: (value) => value }, '@/api/system': { setting }
})

function sourceFiles(directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? sourceFiles(file) : [file]
  })
}

test('all production controls use known semantic icons and no legacy renderer', () => {
  const { iconNames } = loadModule(read('packages/ui-icons/src/index.js'), {})
  for (const file of sourceFiles('src').filter((name) => /\.(vue|js|scss)$/.test(name))) {
    const source = read(file)
    assert.doesNotMatch(source, /liquid-icon--|liquid-icon-svg|svg-icon|LiquidNavIcon/, file)
    if (!file.endsWith('.vue')) continue
    const template = compiler.parse({ source }).template
    if (!template) continue
    assert.deepEqual(compiler.compileTemplate({ source: template.content, filename: file }).errors, [], file)
    for (const match of template.content.matchAll(/<app-icon\b[^>]*?\sname="([^"]+)"/g)) {
      assert.ok(iconNames.includes(match[1]), `${file}: ${match[1]}`)
    }
    for (const match of template.content.matchAll(/\sicon="([^"]+)"/g)) {
      assert.ok(iconNames.includes(match[1]), `${file}: ${match[1]}`)
    }
  }
  assert.match(read('src/main.js'), /createVue2Components\([\s\S]*?renderIcon/)
  assert.match(read('src/components/AppIcon/index.js'), /renderIcon\(h, props.name, \{\}, data\)/)
  assert.match(read('src/styles/icons.scss'), /app-icon--loading[\s\S]*animation:/)
  assert.doesNotMatch(read('src/styles/icons.scss'), /background:|box-shadow:|padding:|border-radius:/)
})

test('central ambient color is theme-aware and limited to phone/tablet layouts', () => {
  const css = read('src/styles/prototype-runtime.scss')
  assert.equal((read('src/App.vue').match(/class="ambient__center"/g) || []).length, 1)
  assert.match(css, /\.ambient \.ambient__center\s*\{\s*display: none;/)
  assert.match(css, /@media \(max-width: 1060px\)\s*\{\s*\.ambient \.ambient__center\s*\{[^}]*display: block;[^}]*background: var\(--blob-e\)/)
  assert.match(css, /\.ambient\s*\{[^}]*pointer-events: none;/)
})

test('branding has a safe fallback and ignores unrelated settings', () => {
  const { panelBranding, updatePanelBranding } = loadBranding()
  assert.equal(panelBranding.systemName, 'Trojan Panel')
  updatePanelBranding({ systemName: '  海蓝面板  ' })
  assert.equal(panelBranding.systemName, '海蓝面板')
  updatePanelBranding({ registerEnable: 1 })
  assert.equal(panelBranding.systemName, '海蓝面板')
  updatePanelBranding({ systemName: '  ' })
  assert.equal(panelBranding.systemName, 'Trojan Panel')
})

test('concurrent settings requests share a request; late responses cannot undo a save', async () => {
  let complete, calls = 0
  const brand = loadBranding(() => { calls++; return new Promise((resolve) => { complete = resolve }) })
  const request = brand.loadPanelSettings()
  assert.equal(brand.loadPanelSettings(), request)
  assert.equal(calls, 1)
  brand.updatePanelBranding({ systemName: 'Saved name' })
  complete({ data: { systemName: 'Stale name', captchaEnable: 1 } })
  assert.equal((await request).data.captchaEnable, 1)
  assert.equal(brand.panelBranding.systemName, 'Saved name')
})

test('failed public settings can be retried', async () => {
  let calls = 0
  const brand = loadBranding(() => ++calls === 1
    ? Promise.reject(new Error('offline'))
    : Promise.resolve({ data: { systemName: 'Restored' } }))
  await assert.rejects(brand.loadPanelSettings(), /offline/)
  await brand.loadPanelSettings()
  assert.equal(brand.panelBranding.systemName, 'Restored')
})

test('logo refresh busts caches and lets failed images retry', () => {
  const brand = loadBranding()
  const oldUrl = brand.panelBranding.logoUrl
  brand.refreshPanelLogo()
  assert.notEqual(brand.panelBranding.logoUrl, oldUrl)
  const refreshed = brand.panelBranding.logoUrl
  brand.refreshPanelLogo()
  assert.notEqual(brand.panelBranding.logoUrl, refreshed)
  const descriptor = compiler.parse({ source: read('src/components/PanelLogo/index.vue') })
  const component = loadModule(descriptor.script.content, { '@/utils/panel-branding': brand }).default
  const context = { branding: brand.panelBranding, failed: true }
  component.watch['branding.logoUrl'].call(context)
  assert.equal(context.failed, false)
  brand.updatePanelBranding({ systemName: '海蓝' })
  assert.equal(component.computed.initial.call(context), '海')
})

test('auth and 404 share panels and branding; 404 has a real router action', () => {
  for (const file of ['src/views/login/index.vue', 'src/views/register/index.vue', 'src/views/404.vue']) {
    const source = read(file)
    const descriptor = compiler.parse({ source })
    assert.deepEqual(compiler.compileTemplate({ source: descriptor.template.content, filename: file }).errors, [])
    assert.match(source, /<ui-panel/)
    assert.match(source, /<panel-logo/)
    assert.doesNotMatch(source, /login-container|wscn-http404|FROSTED GLASS/)
  }
  assert.match(read('src/views/404.vue'), /\$router\.push\('\/dashboard\/index'\)/)
  assert.doesNotMatch(read('src/views/404.vue'), /href=""|1200px|@keyframes/)
})

test('logo upload refreshes shared branding only after success; failures keep the previous logo', async () => {
  let fail = false, refreshes = 0, notifications = 0
  const descriptor = compiler.parse({ source: read('src/components/UploadLogo/index.vue') })
  const component = loadModule(descriptor.script.content, {
    '@/utils/liquid-feedback': { Message() {} },
    '@/api/system': { uploadLogo: async () => { if (fail) throw new Error('upload failed') } },
    '@/components/PanelLogo': {},
    '@/utils/panel-branding': { refreshPanelLogo: () => { refreshes++ } }
  }, { FormData: class { append() {} } }).default
  const context = {
    uploading: false, beforeUpload: () => true,
    $t: (key) => key, $notify: () => { notifications++ }
  }
  const event = () => ({ target: { files: [{ type: 'image/png', size: 10 }], value: 'logo.png' } })
  await component.methods.handleNativeFile.call(context, event())
  assert.equal(refreshes, 1)
  assert.equal(notifications, 1)
  assert.equal(context.uploading, false)
  fail = true
  await component.methods.handleNativeFile.call(context, event())
  assert.equal(refreshes, 1)
  assert.equal(notifications, 1)
  assert.equal(context.uploading, false)
})

test('removed CSS cannot override current labels and controls', () => {
  const styles = fs.readdirSync(path.join(root, 'src/styles'))
    .filter((file) => file.endsWith('.scss')).map((file) => read(`src/styles/${file}`)).join('\n')
  const stale = styles.match(/login-container|sidebar-container|tags-view-container|client-selector__hint|liquid-input__inner|liquid-select-dropdown|liquid-radio-button|dialog-fade/)
  assert.equal(stale && stale[0], null, 'Legacy selector was reintroduced')
  assert.match(styles, /\.fld > span:first-child\s*{\s*color: var\(--form-label-ink\)/)
  assert.match(styles, /\.ui-supporting-text\s*{\s*color: var\(--supporting-text-ink\)/)
  assert.match(styles, /\.liquid-table th\s*{\s*color: var\(--table-header-ink\)/)
  assert.match(read('src/layout/components/AppMain.vue'), /state.tagsView.cachedViews/)
  assert.equal(fs.existsSync(path.join(root, 'src/layout/components/Sidebar/index.vue')), false)
})

test('tables render an empty state while async callers supply null, then render loaded rows', () => {
  const Vue = require('vue')
  const { LiquidTable } = loadModule(read('src/components/LiquidStructural/index.js'), { vue: Vue })
  const table = new Vue({ ...LiquidTable, propsData: { data: null } })
  const text = (node) => node.text || (node.children || []).map(text).join('')
  const render = () => LiquidTable.render.call(table, table.$createElement)
  assert.match(text(render()), /暂无数据/)
  table.columns = [{ prop: 'name', label: 'Name', $scopedSlots: {} }]
  table.data = [{ id: 1, name: 'Loaded row' }]
  assert.match(text(render()), /Loaded row/)
  table.$destroy()
})

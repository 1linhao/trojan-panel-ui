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

test('mobile fields and search boxes retain the shared width cap', () => {
  const postcss = require('postcss')
  for (const [name, selector] of Object.entries({ LiquidInput: '.liquid-input', LiquidNumberInput: '.liquid-number-input', LiquidSelect: '.liquid-select', LiquidDatePicker: '.liquid-date-picker' })) {
    const css = compiler.parse({ source: read(`src/components/${name}/index.vue`) }).styles[0].content
    let bounded = false
    postcss.parse(css).walkRules((rule) => {
      if (rule.selector !== selector) return
      rule.walkDecls((decl) => {
        if (decl.prop === 'max-width') {
          assert.notEqual(decl.value, 'none', `${name} must not remove its width cap on mobile`)
          if (decl.value === 'var(--control-max-width)') bounded = true
        }
      })
    })
    assert.ok(bounded, `${name} must declare the shared maximum width`)
  }
  const css = postcss.parse(read('src/styles/prototype-runtime.scss'))
  let searchBounded = false, shrinkableInput = false
  css.walkRules((rule) => {
    if (rule.selector === '.search-box') rule.walkDecls('max-width', (decl) => { searchBounded ||= decl.value === 'min(100%, var(--control-max-width))' })
    if (rule.selector === '.search-box input') rule.walkDecls('min-width', (decl) => { shrinkableInput ||= decl.value === '0' })
  })
  assert.ok(searchBounded, 'search shell must cap its width even when mobile flex grows')
  assert.ok(shrinkableInput, 'search input must shrink within its shell')
})

test('form controls inherit stable labels and errors without replacing explicit accessible names', () => {
  const adapter = loadModule(read('src/mixins/liquid-form-control.js'), {}).default
  const item = { label: '服务器名称', labelId: 'label-1', errorId: 'error-1', error: '' }
  const control = { _uid: 2, liquidFormItem: item, $attrs: {} }
  let attrs = adapter.computed.controlAttrs.call(control)
  assert.equal(attrs.id, 'liquid-control-2')
  assert.equal(attrs['aria-labelledby'], 'label-1')
  item.error = '必填'
  control.$attrs = { id: 'explicit', 'aria-label': '自定义名称', 'aria-describedby': 'hint' }
  attrs = adapter.computed.controlAttrs.call(control)
  assert.equal(attrs.id, 'explicit')
  assert.equal(attrs['aria-label'], '自定义名称')
  assert.equal(attrs['aria-labelledby'], undefined)
  assert.equal(attrs['aria-describedby'], 'hint error-1')
  assert.equal(attrs['aria-invalid'], 'true')
  item.error = ''
  attrs = adapter.computed.controlAttrs.call(control)
  assert.equal(attrs['aria-describedby'], 'hint')
  assert.equal(attrs['aria-invalid'], undefined)
  control.liquidFormItem = null
  assert.equal(adapter.computed.controlAttrs.call(control).id, 'explicit')
})

test('form item labels target registered primary controls and follow conditional removal', () => {
  const { LiquidFormItem } = loadModule(read('src/components/LiquidStructural/index.js'), { vue: {} })
  const item = { controls: [] }
  const first = { controlAttrs: { id: 'first' } }, second = { controlAttrs: { id: 'second' } }
  LiquidFormItem.methods.addControl.call(item, first)
  LiquidFormItem.methods.addControl.call(item, first)
  LiquidFormItem.methods.addControl.call(item, second)
  assert.equal(item.controls.length, 2)
  assert.equal(LiquidFormItem.computed.labelTarget.call(item), 'first')
  LiquidFormItem.methods.removeControl.call(item, first)
  assert.equal(LiquidFormItem.computed.labelTarget.call(item), 'second')
  for (const name of ['LiquidInput', 'LiquidNumberInput', 'LiquidSelect', 'LiquidDatePicker', 'LiquidSwitch']) {
    assert.match(read(`src/components/${name}/index.vue`), /v-bind="controlAttrs"/)
  }
})

test('navigation interaction owns button transitions; component skins cannot override them', () => {
  const postcss = require('postcss')
  const targets = {
    'src/styles/buttons.scss': ['.liquid-button'],
    'src/styles/prototype-runtime.scss': ['.cap', '.icon-btn', '.dd-item', '.nav-item', '.prototype-mobile-nav button'],
    'src/components/LiquidNumberInput/index.vue': ['.liquid-number-input__step'],
    'src/components/LiquidSwitch/index.vue': ['.liquid-switch'],
    'src/components/LiquidCodeEditor/index.vue': ['.liquid-code-editor__toolbar button'],
    'src/components/LiquidSelect/index.vue': ['.liquid-select__trigger', '.liquid-select__option'],
    'src/components/LiquidDatePicker/index.vue': ['.liquid-date-picker__trigger'],
    'src/views/node/list/components/NodeClientSelector.vue': ['.client-choice']
  }
  for (const [file, selectors] of Object.entries(targets)) {
    const source = read(file)
    const css = file.endsWith('.vue') ? compiler.parse({ source }).styles[0].content : source
    postcss.parse(css).walkRules((rule) => {
      if (selectors.includes(rule.selector)) rule.walkDecls(/^transition/, () => assert.fail(file + ': duplicate button transition'))
    })
  }
  assert.match(read('packages/ui-components-vue2/src/button-interactions.css'), /transition-duration: var\(--ui-motion-slow, 300ms\)/)
})

test('avatar and account name form a separate keyboard-operable profile entry', () => {
  const source = read('src/layout/index.vue')
  assert.match(source, /class="prototype-profile-entry"[\s\S]*?type="button"[\s\S]*?aria-label="我的个人资料"[\s\S]*?@click="go\('\/modify\/index'\)"/)
  assert.match(source, /<strong>\{\{ username \|\| 'Trojan Panel' \}\}<\/strong>\s*<\/button>\s*<button[\s\S]*?aria-label="退出登录"/)
})

test('control size aliases resolve to the public size contract and compact controls consume it', () => {
  const sizes = loadModule(read('src/mixins/liquid-control-size.js'), {}).default
  for (const [size, expected] of Object.entries({ mini: 'sm', small: 'sm', medium: 'md', default: 'md', large: 'lg', sm: 'sm', md: 'md', lg: 'lg' })) {
    assert.equal(sizes.computed.controlSize.call({ size }), expected)
    assert.equal(sizes.props.size.validator(size), true)
  }
  for (const name of ['LiquidButton', 'LiquidSelect', 'LiquidDatePicker']) {
    assert.match(read(`src/components/${name}/index.vue`), /:data-ui-size="controlSize"/)
  }
  assert.match(read('src/styles/buttons.scss'), /min-height: var\(--ui-control-size-height, 38px\)/)
  assert.match(read('src/components/LiquidSelect/index.vue'), /min-height: var\(--ui-control-size-height, 42px\)/)
})

test('clear controls are native siblings and closed popovers do not swallow dialog Escape', () => {
  for (const name of ['LiquidSelect', 'LiquidDatePicker']) {
    const source = read(`src/components/${name}/index.vue`)
    assert.doesNotMatch(source, /role="button"/)
    assert.match(source, /<button[^>]*aria-label="清空(?:日期)?"/)
    const script = compiler.parse({ source }).script.content
    const component = loadModule(script, {
      '@/mixins/liquid-control-emitter': {},
      '@/mixins/liquid-form-control': {},
      '@/mixins/liquid-control-size': {}
    }, { document: {} }).default
    let prevented = 0, closed = 0
    const instance = { open: false, closeMenu: () => closed++, closePopover: () => closed++, $refs: { trigger: { focus() {} } } }
    const event = { preventDefault: () => prevented++, stopPropagation() {} }
    component.methods.handleEscape.call(instance, event)
    assert.equal(prevented, 0)
    assert.equal(closed, 0)
    instance.open = true
    component.methods.handleEscape.call(instance, event)
    assert.equal(prevented, 1)
    assert.equal(closed, 1)
  }
})

test('confirm and prompt render shared dialog controls, validate safely, and settle exactly once', async () => {
  let instance, removed = 0, destroyed = 0
  const dialog = {}, input = {}, button = {}
  function Vue(options) {
    instance = this
    Object.assign(this, options.data, {
      _uid: 9, $refs: { input: { focus() {} } },
      $el: { remove: () => removed++ },
      $nextTick: (callback) => callback(),
      $destroy: () => destroyed++,
      $mount() {}
    })
    for (const [name, method] of Object.entries(options.methods)) this[name] = method.bind(this)
    this.render = () => options.render.call(this, (tag, data, children) => ({ tag, data, children }))
  }
  const { MessageBox } = loadModule(read('src/utils/liquid-feedback.js'), {
    vue: Vue, '@tp-ui/components-vue2': { UiDialog: dialog }, '@tp-ui/icons': { renderIcon() {} },
    '@tp-ui/motion-native': { afterTransition() {} },
    '@/components/LiquidInput': input, '@/components/LiquidButton': button
  }, { document: { body: { appendChild() {} } } })
  const promise = MessageBox.prompt('名称', '编辑', { inputPattern: /^[a-z]+$/g, inputValue: '123', inputErrorMessage: '请使用字母' })
  const vnode = instance.render()
  assert.equal(vnode.tag, dialog)
  assert.equal(vnode.data.props.role, 'alertdialog')
  assert.equal(vnode.children[1].children[0].tag, input)
  assert.equal(vnode.children[2].children[0].tag, button)
  instance.confirm()
  assert.equal(instance.error, '请使用字母')
  assert.equal(destroyed, 0)
  instance.value = 'valid'
  instance.confirm()
  instance.confirm()
  const result = await promise
  assert.equal(result.value, 'valid')
  assert.equal(result.action, 'confirm')
  assert.equal(destroyed, 1)
  assert.equal(removed, 1)
  const cancel = MessageBox.confirm('删除？', '确认')
  instance.render().data.on.close()
  await assert.rejects(cancel, (error) => error === 'cancel')
})

test('production animation timings and overlay material have a single owner', () => {
  for (const file of sourceFiles('src').filter((file) => /\.(vue|scss)$/.test(file))) {
    assert.doesNotMatch(read(file), /(?:transition|animation)[\w-]*:\s*[^;{}]*\b\d+(?:\.\d+)?m?s\b/, file)
    assert.doesNotMatch(read(file), /#[a-fA-F0-9]{3,8}\b|rgba?\(|blur\(\d/, file)
  }
  const material = read('packages/ui-material-frosted/src/overlay.css')
  assert.doesNotMatch(material, /\.tp-ui-|(?:^|[;{])\s*(?:background|border|color|backdrop-filter):/)
  for (const file of ['src/styles/frosted-surfaces.scss', 'src/styles/liquid-structural.scss', 'src/styles/prototype-runtime.scss']) {
    assert.doesNotMatch(read(file), /\.tp-ui-dialog(?:__header|__body|__footer|__close|-layer)?\s*\{/)
  }
  assert.doesNotMatch(read('src/utils/liquid-feedback.js'), /liquid-feedback-layer|liquid-message-box|setTimeout\([^\n]*180/)
  assert.doesNotMatch(read('src/utils/scroll-to.js'), /Math\.ease|requestAnimFrame/)
  assert.match(read('src/styles/index.scss'), /@tp-ui\/material-frosted\/production.css/)
  assert.match(read('src/main.js'), /setAttribute\('data-ui-material', 'frosted'\)/)
  assert.doesNotMatch(read('src/styles/icons.scss'), /prefers-reduced-motion/)
  assert.match(read('src/components/LiquidTag/index.vue'), /<button v-if="\$listeners.click"/)
  assert.match(read('src/components/LiquidTag/index.vue'), /@click.stop="\$emit\('close'/)
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

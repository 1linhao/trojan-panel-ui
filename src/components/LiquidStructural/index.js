import Vue from 'vue'
import { UiDialog } from '@tp-ui/components-vue2'

const px = (value) => {
  if (value === undefined || value === null || value === '') return undefined
  return typeof value === 'number' || /^\d+$/.test(String(value))
    ? `${value}px`
    : value
}

const getValue = (object, path) => {
  if (!path) return object
  return String(path)
    .replace(/\[(\w+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .reduce((value, key) => (value == null ? value : value[key]), object)
}

export const LiquidTableColumn = {
  name: 'LiquidTableColumn',
  props: {
    prop: String,
    label: [String, Number],
    width: [String, Number],
    minWidth: [String, Number],
    align: String,
    type: String
  },
  created() {
    let table = this.$parent
    while (table && table.$options.name !== 'LiquidTable') table = table.$parent
    this.liquidTable = table
    if (table) table.addColumn(this)
  },
  beforeDestroy() { if (this.liquidTable) this.liquidTable.removeColumn(this) },
  render(h) { return h('span', { class: 'liquid-table-column-definition' }) }
}

export const LiquidTable = {
  name: 'LiquidTable',
  props: {
    data: { type: Array, default: () => [] },
    border: Boolean
  },
  data: () => ({ columns: [] }),
  methods: {
    addColumn(column) {
      if (!this.columns.includes(column)) this.columns.push(column)
    },
    removeColumn(column) { this.columns = this.columns.filter((item) => item !== column) }
  },
  render(h) {
    const columns = this.columns.map((column) => ({
      prop: column.prop,
      label: column.label,
      width: column.width,
      minWidth: column.minWidth,
      align: column.align,
      type: column.type,
      slot: column.$scopedSlots.default
    }))
    const colgroup = h('colgroup', columns.map((column) => h('col', {
      style: { width: px(column.width), minWidth: px(column.minWidth) }
    })))
    const head = h('thead', [h('tr', columns.map((column) => h('th', {
      style: { textAlign: column.align || 'left', width: px(column.width), minWidth: px(column.minWidth) }
    }, [String(column.label == null ? '' : column.label)])))])
    const rows = this.data.length
      ? this.data.map((row, index) => h('tr', { key: row.id == null ? index : row.id }, columns.map((column) => {
        let content
        if (column.slot) content = column.slot({ row, $index: index, column })
        else if (column.type === 'index') content = String(index + 1)
        else {
          const value = getValue(row, column.prop)
          content = value == null ? '' : String(value)
        }
        return h('td', { style: { textAlign: column.align || 'left' } }, Array.isArray(content) ? content : [content])
      })))
      : [h('tr', { class: 'liquid-table__empty-row' }, [h('td', { attrs: { colspan: Math.max(columns.length, 1) } }, ['暂无数据'])])]
    return h('div', { class: ['liquid-table', { 'is-bordered': this.border }] }, [
      h('div', { class: 'liquid-table__definitions', attrs: { 'aria-hidden': 'true' } }, this.$slots.default),
      h('div', { class: 'liquid-table__scroll' }, [h('table', [colgroup, head, h('tbody', rows)])])
    ])
  }
}

export const LiquidForm = {
  name: 'LiquidForm',
  componentName: 'LiquidForm',
  props: {
    model: Object,
    rules: Object,
    labelWidth: String,
    labelPosition: { type: String, default: 'right' }
  },
  provide() { return { liquidForm: this } },
  data: () => ({ fields: [] }),
  methods: {
    addField(field) { if (!this.fields.includes(field)) this.fields.push(field) },
    removeField(field) { this.fields = this.fields.filter((item) => item !== field) },
    clearValidate(props) {
      const selected = props ? (Array.isArray(props) ? props : [props]) : null
      this.fields.forEach((field) => { if (!selected || selected.includes(field.prop)) field.clearValidate() })
    },
    resetFields() { this.fields.forEach((field) => field.resetField()) },
    validate(callback) {
      return Promise.all(this.fields.map((field) => field.validate())).then((results) => {
        const valid = results.every(Boolean)
        if (callback) callback(valid)
        return valid
      }).catch(() => {
        if (callback) callback(false)
        return false
      })
    }
  },
  render(h) {
    return h('form', {
      class: ['liquid-form', `is-label-${this.labelPosition}`],
      on: { submit: (event) => event.preventDefault() }
    }, this.$slots.default)
  }
}

export const LiquidFormItem = {
  name: 'LiquidFormItem',
  componentName: 'LiquidFormItem',
  inject: { liquidForm: { default: null } },
  props: { label: [String, Number], prop: String, rules: [Object, Array], labelWidth: String },
  data: () => ({ error: '', initialValue: undefined }),
  computed: {
    value() { return this.liquidForm && this.prop ? getValue(this.liquidForm.model, this.prop) : undefined },
    appliedRules() {
      const formRules = this.liquidForm && this.liquidForm.rules && this.liquidForm.rules[this.prop]
      const rules = this.rules || formRules || []
      return Array.isArray(rules) ? rules : [rules]
    }
  },
  mounted() {
    this.initialValue = this.value
    if (this.liquidForm && this.prop) this.liquidForm.addField(this)
    this.$on('liquid.form.change', () => this.validate('change'))
    this.$on('liquid.form.blur', () => this.validate('blur'))
  },
  beforeDestroy() { if (this.liquidForm) this.liquidForm.removeField(this) },
  methods: {
    clearValidate() { this.error = '' },
    resetField() {
      if (!this.liquidForm || !this.prop) return
      const segments = this.prop.replace(/\[(\w+)\]/g, '.$1').split('.')
      const key = segments.pop()
      const target = segments.reduce((value, segment) => value && value[segment], this.liquidForm.model)
      if (target) Vue.set(target, key, this.initialValue)
      this.clearValidate()
    },
    async validate(trigger) {
      const rules = this.appliedRules.filter((rule) => !trigger || !rule.trigger || rule.trigger === trigger || (Array.isArray(rule.trigger) && rule.trigger.includes(trigger)))
      for (const rule of rules) {
        const empty = this.value === '' || this.value === null || this.value === undefined || (Array.isArray(this.value) && !this.value.length)
        let error = ''
        if (rule.required && empty) error = rule.message || '此项为必填项'
        else if (!empty && rule.min != null && String(this.value).length < rule.min) error = rule.message || `至少输入 ${rule.min} 个字符`
        else if (!empty && rule.max != null && String(this.value).length > rule.max) error = rule.message || `最多输入 ${rule.max} 个字符`
        else if (!empty && rule.pattern && !rule.pattern.test(String(this.value))) error = rule.message || '格式不正确'
        else if (rule.validator) {
          error = await new Promise((resolve) => {
            let settled = false
            const done = (reason) => { if (!settled) { settled = true; resolve(reason ? (reason.message || String(reason)) : '') } }
            try {
              const result = rule.validator(rule, this.value, done)
              if (result && typeof result.then === 'function') result.then(() => done()).catch(done)
            } catch (reason) { done(reason) }
          })
        }
        if (error) { this.error = error; return false }
      }
      this.error = ''
      return true
    }
  },
  render(h) {
    const width = this.labelWidth || (this.liquidForm && this.liquidForm.labelWidth)
    return h('div', { class: ['liquid-form-item', { 'is-error': this.error }] }, [
      this.label != null ? h('label', { class: 'liquid-form-item__label', style: { width: width || undefined } }, [String(this.label)]) : null,
      h('div', { class: 'liquid-form-item__content', style: width && this.liquidForm && this.liquidForm.labelPosition !== 'top' ? { marginLeft: width } : undefined }, [
        ...(this.$slots.default || []),
        this.error ? h('div', { class: 'liquid-form-item__error' }, [this.error]) : null
      ])
    ])
  }
}

// Compatibility Adapter: existing business views keep the LiquidDialog name
// while modal lifecycle and animation anatomy live in the shared Module.
export const LiquidDialog = { ...UiDialog, name: 'LiquidDialog' }

export const LiquidCard = {
  name: 'LiquidCard',
  functional: true,
  render(h, context) {
    return h('section', { ...context.data, class: ['liquid-card', context.data.class, context.data.staticClass] }, [
      context.slots().header ? h('header', { class: 'liquid-card__header' }, context.slots().header) : null,
      h('div', { class: 'liquid-card__body' }, context.slots().default)
    ])
  }
}

export const LiquidDescriptionsItem = { name: 'LiquidDescriptionsItem', functional: true, props: { label: [String, Number] }, render: () => null }
export const LiquidDescriptions = {
  name: 'LiquidDescriptions',
  props: { column: { type: Number, default: 3 }, border: Boolean },
  render(h) {
    const items = (this.$slots.default || []).filter((vnode) => vnode && vnode.componentOptions).map((vnode) => ({
      label: vnode.componentOptions.propsData && vnode.componentOptions.propsData.label,
      content: vnode.componentOptions.children || []
    }))
    return h('dl', { class: ['liquid-descriptions', { 'is-bordered': this.border }], style: { gridTemplateColumns: `repeat(${this.column}, minmax(0, 1fr))` } }, items.map((item) => h('div', { class: 'liquid-descriptions__item' }, [h('dt', [String(item.label || '')]), h('dd', item.content)])))
  }
}

export const LiquidRow = { name: 'LiquidRow', functional: true, props: { gutter: [String, Number] }, render(h, context) { const gap = px(context.props.gutter); return h('div', { ...context.data, class: ['liquid-row', context.data.class, context.data.staticClass], style: [{ gap }, context.data.style] }, context.children) } }
export const LiquidCol = { name: 'LiquidCol', functional: true, props: { span: [String, Number], xs: [String, Number], sm: [String, Number], md: [String, Number], lg: [String, Number] }, render(h, context) { const p = context.props; return h('div', { ...context.data, class: ['liquid-col', p.xs && `liquid-col-xs-${p.xs}`, p.sm && `liquid-col-sm-${p.sm}`, p.md && `liquid-col-md-${p.md}`, p.lg && `liquid-col-lg-${p.lg}`, context.data.class, context.data.staticClass] }, context.children) } }

export const LiquidScrollbar = {
  name: 'LiquidScrollbar',
  props: { wrapClass: String, vertical: { type: Boolean, default: true } },
  render(h) { return h('div', { class: 'liquid-scrollbar' }, [h('div', { ref: 'wrap', class: ['liquid-scrollbar__wrap', this.wrapClass, { 'is-horizontal': !this.vertical }] }, this.$slots.default)]) }
}

export const LiquidTooltip = { name: 'LiquidTooltip', functional: true, props: { content: String, placement: String }, render(h, context) { return h('span', { ...context.data, class: ['liquid-tooltip', context.data.class], attrs: { title: context.props.content } }, context.children) } }

export const LiquidDropdown = {
  name: 'LiquidDropdown',
  provide() { return { liquidDropdown: this } },
  data: () => ({ open: false }),
  methods: { command(value) { this.$emit('command', value); this.open = false } },
  render(h) { return h('div', { class: 'liquid-dropdown' }, [h('div', { class: 'liquid-dropdown__trigger', on: { click: () => { this.open = !this.open } } }, this.$slots.default), this.open ? h('div', { class: 'liquid-dropdown__panel' }, this.$slots.dropdown) : null]) }
}
export const LiquidDropdownMenu = { name: 'LiquidDropdownMenu', functional: true, render(h, context) { return h('ul', { ...context.data, class: ['liquid-dropdown-menu', context.data.class] }, context.children) } }
export const LiquidDropdownItem = { name: 'LiquidDropdownItem', inject: { liquidDropdown: { default: null } }, props: { command: null, disabled: Boolean, divided: Boolean }, render(h) { return h('li', { class: ['liquid-dropdown-item', { 'is-disabled': this.disabled, 'is-divided': this.divided }], on: { click: () => { if (!this.disabled && this.liquidDropdown) this.liquidDropdown.command(this.command) } } }, this.$slots.default) } }

export const LiquidMenu = { name: 'LiquidMenu', provide() { return { liquidMenu: this } }, props: { defaultActive: String, collapse: Boolean, mode: String }, render(h) { return h('nav', { class: ['liquid-menu', { 'is-collapsed': this.collapse }] }, this.$slots.default) } }
export const LiquidMenuItem = { name: 'LiquidMenuItem', inject: { liquidMenu: { default: null } }, props: { index: String }, render(h) { return h('div', { class: ['liquid-menu-item', { 'is-active': this.liquidMenu && this.liquidMenu.defaultActive === this.index }] }, this.$slots.default) } }
export const LiquidSubmenu = { name: 'LiquidSubmenu', props: { index: String }, data: () => ({ open: true }), render(h) { return h('section', { class: ['liquid-submenu', { 'is-open': this.open }] }, [h('div', { class: 'liquid-submenu__title', on: { click: () => { this.open = !this.open } } }, this.$slots.title), this.open ? h('div', { class: 'liquid-submenu__content' }, this.$slots.default) : null]) } }

export const LiquidBreadcrumb = { name: 'LiquidBreadcrumb', functional: true, props: { separator: { type: String, default: '/' } }, provide() { return {} }, render(h, context) { const children = (context.children || []).reduce((all, child, index) => all.concat(index ? [h('span', { class: 'liquid-breadcrumb__separator' }, [context.props.separator]), child] : [child]), []); return h('nav', { ...context.data, class: ['liquid-breadcrumb', context.data.class] }, children) } }
export const LiquidBreadcrumbItem = { name: 'LiquidBreadcrumbItem', functional: true, render(h, context) { return h('span', { ...context.data, class: ['liquid-breadcrumb__item', context.data.class] }, context.children) } }

export const structuralComponents = {
  LiquidBreadcrumb, LiquidBreadcrumbItem, LiquidCard, LiquidCol,
  LiquidDescriptions, LiquidDescriptionsItem, LiquidDialog, LiquidDropdown,
  LiquidDropdownItem, LiquidDropdownMenu, LiquidForm, LiquidFormItem,
  LiquidMenu, LiquidMenuItem, LiquidRow, LiquidScrollbar, LiquidSubmenu,
  LiquidTable, LiquidTableColumn, LiquidTooltip
}

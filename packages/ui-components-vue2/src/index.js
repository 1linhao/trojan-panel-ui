import { BUTTON_INTERACTION } from './button-interactions.js'

export {
  BUTTON_INTERACTION,
  createButtonInteractionController,
  createCssButtonInteractionAdapter
} from './button-interactions.js'

function semanticData(component, overrides = {}) {
  const state = component.disabled
    ? 'disabled'
    : component.loading
    ? 'loading'
    : component.invalid
    ? 'invalid'
    : 'idle'
  return {
    'data-ui-surface': overrides.surface || component.surface || 'control',
    'data-ui-tone': component.tone || 'neutral',
    'data-ui-state': state,
    'data-ui-size': component.size || 'md'
  }
}

export const PANEL_VARIANTS = Object.freeze(['auth', 'content', 'metric'])

const sharedSurfaceProps = {
  tone: { type: String, default: 'neutral' },
  density: { type: String, default: 'comfortable' },
  state: { type: String, default: 'idle' },
  // Values are owned and validated by @tp-ui/contracts at the composition seam.
  motionRole: { type: String, default: 'panel' },
  motionKey: { type: String, default: '' }
}

function motionName(key) {
  if (!key) return undefined
  const safeKey = String(key)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+/, '')
  return safeKey ? `ui-${safeKey}` : undefined
}

function surfaceData(context, { surface, classes }) {
  const props = context.props
  const attrs = {
    ...(context.data.attrs || {}),
    'data-ui-surface': surface,
    'data-ui-tone': props.tone,
    'data-ui-density': props.density,
    'data-ui-state': props.state,
    'data-ui-motion-role': props.motionRole,
    'data-ui-motion-key': props.motionKey || null
  }
  const name = motionName(props.motionKey)
  return {
    ...context.data,
    attrs,
    class: [classes, context.data.class],
    style: [context.data.style, name ? { viewTransitionName: name } : null]
  }
}

function surfaceChildren(h, context, prefix) {
  const slots = context.slots()
  return [
    slots.header
      ? h(
          'header',
          {
            class: `${prefix}__header`,
            attrs: { 'data-ui-part': 'header' }
          },
          slots.header
        )
      : null,
    h(
      'div',
      {
        class: `${prefix}__body`,
        attrs: { 'data-ui-part': 'body' }
      },
      slots.default
    ),
    slots.footer
      ? h(
          'footer',
          {
            class: `${prefix}__footer`,
            attrs: { 'data-ui-part': 'footer' }
          },
          slots.footer
        )
      : null
  ]
}

export const UiPanel = {
  name: 'UiPanel',
  functional: true,
  props: {
    ...sharedSurfaceProps,
    variant: {
      type: String,
      default: 'content',
      validator: (value) => PANEL_VARIANTS.includes(value)
    },
    tag: { type: String, default: 'section' }
  },
  render(h, context) {
    const { variant, tag } = context.props
    const legacyClasses = {
      auth: ['glass', 'raised', 'auth-card'],
      content: ['glass', 'card'],
      metric: ['glass']
    }
    const data = surfaceData(context, {
      surface: variant === 'auth' ? 'raised' : 'panel',
      classes: ['tp-ui-panel', `tp-ui-panel--${variant}`, legacyClasses[variant]]
    })
    data.attrs['data-ui-panel-variant'] = variant
    return h(tag, data, surfaceChildren(h, context, 'tp-ui-panel'))
  }
}

export const UiSheet = {
  name: 'UiSheet',
  functional: true,
  props: {
    ...sharedSurfaceProps,
    tag: { type: String, default: 'aside' }
  },
  render(h, context) {
    return h(
      context.props.tag,
      surfaceData(context, {
        surface: 'raised',
        classes: ['tp-ui-sheet', 'glass', 'sheet']
      }),
      surfaceChildren(h, context, 'tp-ui-sheet')
    )
  }
}

export const UiDialog = {
  name: 'UiDialog',
  props: {
    visible: Boolean,
    title: [String, Number],
    width: { type: [String, Number], default: '50%' },
    customClass: String,
    closeOnClickModal: { type: Boolean, default: true },
    closeOnEscape: { type: Boolean, default: true },
    showClose: { type: Boolean, default: true },
    appendToBody: Boolean,
    tone: { type: String, default: 'neutral' },
    motionRole: { type: String, default: 'overlay' },
    motionKey: { type: String, default: '' }
  },
  data: () => ({ returnFocusTo: null }),
  watch: {
    visible(value) {
      if (value) this.open()
      else this.restoreFocus()
    }
  },
  mounted() {
    if (this.visible) this.open()
  },
  beforeDestroy() {
    this.releaseKeyboard()
    this.restoreFocus()
  },
  methods: {
    open() {
      this.returnFocusTo = document.activeElement
      document.addEventListener('keydown', this.onKeydown)
      this.$nextTick(() => {
        this.$refs.dialog?.focus()
        this.$emit('open')
      })
    },
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    modalClick(event) {
      if (this.closeOnClickModal && event.target === event.currentTarget)
        this.close()
    },
    onKeydown(event) {
      if (event.key === 'Escape' && this.closeOnEscape) this.close()
    },
    releaseKeyboard() {
      document.removeEventListener('keydown', this.onKeydown)
    },
    restoreFocus() {
      this.releaseKeyboard()
      this.returnFocusTo?.focus?.()
      this.returnFocusTo = null
    }
  },
  render(h) {
    if (!this.visible) return null
    const width =
      typeof this.width === 'number' || /^\d+$/.test(String(this.width))
        ? `${this.width}px`
        : this.width
    const name = motionName(this.motionKey)
    return h(
      'div',
      {
        class: ['tp-ui-dialog-layer', 'liquid-dialog-layer'],
        attrs: {
          'data-ui-motion-role': this.motionRole,
          'data-ui-motion-key': this.motionKey || null
        },
        on: { mousedown: this.modalClick }
      },
      [
        h(
          'section',
          {
            ref: 'dialog',
            class: ['tp-ui-dialog', 'liquid-dialog', this.customClass],
            style: {
              width,
              viewTransitionName: name
            },
            attrs: {
              role: 'dialog',
              tabindex: '-1',
              'aria-modal': 'true',
              'data-ui-surface': 'overlay',
              'data-ui-tone': this.tone,
              'data-ui-part': 'surface'
            }
          },
          [
            h(
              'header',
              {
                class: ['tp-ui-dialog__header', 'liquid-dialog__header'],
                attrs: { 'data-ui-part': 'header' }
              },
              [
                h(
                  'span',
                  { class: 'liquid-dialog__title' },
                  [String(this.title == null ? '' : this.title)]
                ),
                this.showClose
                  ? h(
                      'button',
                      {
                        class: 'liquid-dialog__close',
                        attrs: { type: 'button', 'aria-label': '关闭' },
                        on: { click: this.close }
                      },
                      ['×']
                    )
                  : null
              ]
            ),
            h(
              'div',
              {
                class: ['tp-ui-dialog__body', 'liquid-dialog__body'],
                attrs: { 'data-ui-part': 'body' }
              },
              this.$slots.default
            ),
            this.$slots.footer
              ? h(
                  'footer',
                  {
                    class: ['tp-ui-dialog__footer', 'liquid-dialog__footer'],
                    attrs: { 'data-ui-part': 'footer' }
                  },
                  this.$slots.footer
                )
              : null
          ]
        )
      ]
    )
  }
}

export const UiButton = {
  name: 'UiButton',
  inheritAttrs: false,
  props: {
    tone: { type: String, default: 'neutral' },
    surface: { type: String, default: 'control' },
    size: { type: String, default: 'md' },
    disabled: Boolean,
    loading: Boolean,
    type: { type: String, default: 'button' }
  },
  render(h) {
    const label =
      this.loading && this.$scopedSlots.loading
        ? this.$scopedSlots.loading()
        : this.$slots.default
    return h(
      'button',
      {
        class: 'tp-ui-button',
        attrs: {
          ...this.$attrs,
          ...semanticData(this),
          [BUTTON_INTERACTION.attribute]: BUTTON_INTERACTION.variant,
          type: this.type,
          disabled: this.disabled || this.loading,
          'aria-busy': this.loading ? 'true' : null
        },
        on: {
          ...this.$listeners,
          click: (event) => {
            if (!this.disabled && !this.loading) this.$emit('click', event)
          }
        }
      },
      label
    )
  }
}

export const UiInput = {
  name: 'UiInput',
  inheritAttrs: false,
  props: {
    value: { type: [String, Number], default: '' },
    tone: { type: String, default: 'neutral' },
    size: { type: String, default: 'md' },
    disabled: Boolean,
    invalid: Boolean
  },
  render(h) {
    return h('input', {
      class: 'tp-ui-input',
      attrs: {
        ...this.$attrs,
        ...semanticData(this, { surface: 'control' }),
        disabled: this.disabled,
        'aria-invalid': this.invalid ? 'true' : null
      },
      domProps: { value: this.value },
      on: {
        ...this.$listeners,
        input: (event) => this.$emit('input', event.target.value)
      }
    })
  }
}

export const COMPONENTS = Object.freeze({
  UiButton,
  UiInput,
  UiPanel,
  UiSheet,
  UiDialog
})

export function createVue2Components({
  include = Object.keys(COMPONENTS)
} = {}) {
  const unknown = include.filter((name) => !COMPONENTS[name])
  if (unknown.length)
    throw new TypeError(`Unknown UI components: ${unknown.join(', ')}`)
  return Object.freeze({
    install(Vue) {
      include.forEach((name) => Vue.component(name, COMPONENTS[name]))
    }
  })
}

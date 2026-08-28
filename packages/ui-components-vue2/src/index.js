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

export const COMPONENTS = Object.freeze({ UiButton, UiInput })

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

<template>
  <button
    class="liquid-switch"
    :class="{ 'is-active': checked }"
    type="button"
    role="switch"
    :aria-checked="checked.toString()"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="liquid-switch__track"><i /></span>
    <span class="liquid-switch__label">{{ checked ? activeText : inactiveText }}</span>
  </button>
</template>

<script>
import emitter from '@/mixins/liquid-control-emitter'

export default {
  name: 'LiquidSwitch',
  mixins: [emitter],
  props: {
    value: { type: [Boolean, Number, String], default: false },
    activeValue: { type: [Boolean, Number, String], default: true },
    inactiveValue: { type: [Boolean, Number, String], default: false },
    activeText: { type: String, default: '开启' },
    inactiveText: { type: String, default: '禁用' },
    disabled: { type: Boolean, default: false }
  },
  computed: {
    checked() {
      return this.value === this.activeValue
    }
  },
  methods: {
    toggle() {
      const value = this.checked ? this.inactiveValue : this.activeValue
      this.$emit('input', value)
      this.$emit('change', value)
      this.dispatch('LiquidFormItem', 'liquid.form.change', [value])
    }
  }
}
</script>

<style scoped>
.liquid-switch {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 38px;
  padding: 4px 11px 4px 5px;
  border: 1px solid var(--control-border);
  border-radius: 999px;
  color: var(--ink-2);
  background: var(--control-fill);
  box-shadow: inset 0 1px 0 var(--spec-soft);
  font: inherit;
  cursor: pointer;
}
.liquid-switch__track {
  position: relative;
  width: 42px;
  height: 28px;
  border-radius: 999px;
  background: var(--neutral-bg);
  transition: background 160ms ease;
}
.liquid-switch__track i {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--glass-popover);
  box-shadow: 0 2px 7px rgba(7, 14, 30, 0.28);
  transition: transform 180ms var(--spring);
}
.liquid-switch.is-active {
  color: var(--accent);
}
.liquid-switch.is-active .liquid-switch__track {
  background: var(--accent);
}
.liquid-switch.is-active .liquid-switch__track i {
  transform: translateX(14px);
}
.liquid-switch__label {
  min-width: 2em;
  font-size: 12.5px;
  font-weight: 650;
}
.liquid-switch:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}
</style>

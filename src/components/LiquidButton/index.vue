<template>
  <button
    class="liquid-button"
    :class="[`is-${type}`, { 'is-icon-only': icon && !$slots.default }]"
    type="button"
    :disabled="disabled || loading"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <i v-if="loading" class="el-icon-loading" aria-hidden="true" />
    <i v-else-if="icon" :class="icon" aria-hidden="true" />
    <span v-if="$slots.default"><slot /></span>
  </button>
</template>

<script>
export default {
  name: 'LiquidButton',
  inheritAttrs: false,
  props: {
    type: { type: String, default: 'default' },
    icon: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.liquid-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  padding: 8px 16px;
  border: 1px solid var(--rim);
  border-radius: 999px;
  color: var(--ink);
  background: var(--glass-input);
  box-shadow: inset 0 1px 0 var(--spec-soft), var(--shadow-soft);
  font: inherit;
  font-size: 12.5px;
  font-weight: 650;
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease,
    background 160ms ease, transform 160ms ease;
}
.liquid-button:hover:not(:disabled) {
  color: var(--accent);
  background: var(--glass-strong);
  transform: translateY(-1px);
}
.liquid-button.is-primary {
  color: var(--on-accent);
  border-color: transparent;
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
}
.liquid-button.is-danger {
  color: var(--bad-fg);
  background: var(--bad-bg);
}
.liquid-button.is-icon-only {
  width: 38px;
  padding: 0;
  border-radius: 13px;
}
.liquid-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 58%, transparent);
  outline-offset: 2px;
}
.liquid-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>

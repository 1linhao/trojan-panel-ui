<template>
  <button
    class="liquid-button"
    data-ui-interaction="nav-lift"
    :class="[`is-${type}`, { 'is-icon-only': icon && !$slots.default }]"
    type="button"
    :disabled="disabled || loading"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <app-icon v-if="loading" name="loading" aria-hidden="true" />
    <app-icon v-else-if="icon" :name="icon" aria-hidden="true" />
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

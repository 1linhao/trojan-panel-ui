<template>
  <label class="liquid-date-picker" :class="{ 'is-focused': focused }">
    <i class="el-icon-date" aria-hidden="true" />
    <input
      class="liquid-date-picker__field"
      :type="nativeType"
      :value="nativeValue"
      v-bind="$attrs"
      @input="handleInput"
      @change="handleChange"
      @focus="focused = true"
      @blur="focused = false"
    />
  </label>
</template>

<script>
export default {
  name: 'LiquidDatePicker',
  inheritAttrs: false,
  props: {
    value: { type: [String, Number, Date], default: '' },
    type: { type: String, default: 'date' },
    valueFormat: { type: String, default: '' }
  },
  data() {
    return { focused: false }
  },
  computed: {
    nativeType() {
      if (this.type === 'datetime') return 'datetime-local'
      if (this.type === 'month') return 'month'
      return 'date'
    },
    nativeValue() {
      if (this.value === '' || this.value === undefined || this.value === null) return ''
      if (this.nativeType !== 'datetime-local') return String(this.value)
      const date = new Date(this.value)
      if (Number.isNaN(date.getTime())) return ''
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      return local.toISOString().slice(0, 16)
    }
  },
  methods: {
    outputValue(value) {
      if (!value) return ''
      return this.valueFormat === 'timestamp' ? new Date(value).getTime() : value
    },
    handleInput(event) {
      this.$emit('input', this.outputValue(event.target.value))
    },
    handleChange(event) {
      this.$emit('change', this.outputValue(event.target.value))
    }
  }
}
</script>

<style scoped>
.liquid-date-picker {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 42px;
  padding: 0 13px;
  border: 1px solid var(--control-border);
  border-radius: 14px;
  color: var(--ink-3);
  background: var(--control-fill);
  box-shadow: inset 0 1px 0 var(--spec-soft);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.liquid-date-picker.is-focused {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent),
    inset 0 1px 0 var(--spec-soft);
}
.liquid-date-picker__field {
  flex: 1;
  min-width: 0;
  height: 40px;
  border: 0;
  outline: 0;
  color: var(--ink);
  background: transparent;
  font: inherit;
  color-scheme: light;
}
[data-theme='dark'] .liquid-date-picker__field {
  color-scheme: dark;
}
</style>

<template>
  <div class="liquid-json-editor" :class="{ 'is-focused': focused, 'is-error': error }">
    <div class="liquid-json-editor__toolbar">
      <span>JSON</span>
      <button type="button" @click="format">格式化</button>
    </div>
    <textarea
      :value="text"
      :aria-invalid="String(Boolean(error))"
      spellcheck="false"
      autocomplete="off"
      @input="handleInput"
      @focus="focused = true"
      @blur="handleBlur"
    />
    <small v-if="error" role="alert">{{ error }}</small>
  </div>
</template>

<script>
function toText(value) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

export default {
  name: 'LiquidJsonEditor',
  props: {
    value: {
      type: [Object, Array, String],
      default: ''
    }
  },
  data() {
    return {
      text: toText(this.value),
      focused: false,
      error: ''
    }
  },
  watch: {
    value: {
      deep: true,
      handler(value) {
        const next = toText(value)
        if (!this.focused && next !== this.text) this.text = next
      }
    }
  },
  methods: {
    handleInput(event) {
      this.text = event.target.value
      this.error = ''
      this.$emit('input', this.text)
    },
    handleBlur() {
      this.focused = false
      this.validate()
    },
    validate() {
      if (!this.text.trim()) {
        this.error = ''
        return true
      }
      try {
        JSON.parse(this.text)
        this.error = ''
        return true
      } catch (error) {
        this.error = `JSON 格式错误：${error.message}`
        return false
      }
    },
    format() {
      if (!this.text.trim()) return
      try {
        this.text = JSON.stringify(JSON.parse(this.text), null, 2)
        this.error = ''
        this.$emit('input', this.text)
      } catch (error) {
        this.error = `JSON 格式错误：${error.message}`
      }
    }
  }
}
</script>

<style scoped>
.liquid-json-editor {
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--control-border);
  border-radius: 16px;
  background: var(--control-fill);
  box-shadow: inset 0 1px 0 var(--spec-soft);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.liquid-json-editor.is-focused {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent),
    inset 0 1px 0 var(--spec-soft);
}

.liquid-json-editor.is-error {
  border-color: var(--bad-fg);
}

.liquid-json-editor__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  padding: 0 10px 0 14px;
  border-bottom: 1px solid var(--hairline);
  color: var(--ink-3);
  background: var(--glass-soft);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.liquid-json-editor__toolbar button {
  padding: 5px 10px;
  border: 1px solid var(--rim);
  border-radius: 10px;
  color: var(--ink-2);
  background: var(--glass-input);
  cursor: pointer;
}

.liquid-json-editor__toolbar button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.liquid-json-editor textarea {
  display: block;
  width: 100%;
  min-height: 320px;
  padding: 14px;
  border: 0;
  outline: 0;
  resize: vertical;
  color: var(--ink);
  background: transparent;
  font: 13px/1.6 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", monospace;
  tab-size: 2;
}

.liquid-json-editor small {
  display: block;
  padding: 0 14px 10px;
  color: var(--bad-fg);
  font-size: 12px;
}

@media (max-width: 720px) {
  .liquid-json-editor textarea {
    min-height: 260px;
  }
}
</style>

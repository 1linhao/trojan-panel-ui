<template>
  <div
    class="liquid-code-editor"
    :class="{ 'is-focused': focused, 'is-error': error }"
  >
    <div class="liquid-code-editor__toolbar">
      <span>{{ languageLabel }}</span>
      <button v-if="format === 'json'" type="button" @click="formatContent">
        {{ formatButtonLabel }}
      </button>
    </div>
    <textarea
      :value="text"
      :aria-label="`${languageLabel} 配置编辑器`"
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
  name: 'LiquidCodeEditor',
  props: {
    value: {
      type: [Object, Array, String],
      default: ''
    },
    languageLabel: {
      type: String,
      default: 'TEXT'
    },
    format: {
      type: String,
      default: ''
    },
    formatButtonLabel: {
      type: String,
      default: '格式化'
    },
    formatErrorPrefix: {
      type: String,
      default: 'JSON 格式错误'
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
      if (this.format !== 'json' || !this.text.trim()) {
        this.error = ''
        return true
      }
      try {
        JSON.parse(this.text)
        this.error = ''
        return true
      } catch (error) {
        this.error = `${this.formatErrorPrefix}：${error.message}`
        return false
      }
    },
    formatContent() {
      if (!this.text.trim()) return
      try {
        this.text = JSON.stringify(JSON.parse(this.text), null, 2)
        this.error = ''
        this.$emit('input', this.text)
      } catch (error) {
        this.error = `${this.formatErrorPrefix}：${error.message}`
      }
    }
  }
}
</script>

<style scoped>
.liquid-code-editor {
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--control-border);
  border-radius: 16px;
  background: var(--control-fill);
  box-shadow: inset 0 1px 0 var(--spec-soft);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.liquid-code-editor.is-focused {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent),
    inset 0 1px 0 var(--spec-soft);
}

.liquid-code-editor.is-error {
  border-color: var(--bad-fg);
}

.liquid-code-editor__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  padding: 0 10px 0 14px;
  border-bottom: 1px solid var(--hairline);
  color: var(--ink-3);
  background: var(--glass-soft);
  font-size: 12px;
  line-height: 1.2;
  letter-spacing: 0.08em;
}

.liquid-code-editor__toolbar button {
  min-height: 30px;
  padding: 0 11px;
  border: 1px solid var(--rim);
  border-radius: 10px;
  color: var(--ink-2);
  background: var(--glass-input);
  font: inherit;
  line-height: 1.2;
  letter-spacing: 0;
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-motion-easing-standard),
    border-color var(--ui-motion-fast) var(--ui-motion-easing-standard),
    background-color var(--ui-motion-fast) var(--ui-motion-easing-standard);
}

.liquid-code-editor__toolbar button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.liquid-code-editor textarea {
  display: block;
  width: 100%;
  min-height: var(--ui-editor-body-min-height, 320px);
  padding: 14px;
  border: 0;
  outline: 0;
  resize: none;
  color: var(--ink);
  background: transparent;
  font: 13px/1.6 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", monospace;
  tab-size: 2;
}

.liquid-code-editor small {
  display: block;
  padding: 0 14px 10px;
  color: var(--bad-fg);
  font-size: 12px;
}

@media (max-width: 720px) {
  .liquid-code-editor textarea {
    min-height: var(
      --ui-editor-mobile-body-min-height,
      var(--ui-editor-body-min-height, 260px)
    );
  }
}
</style>

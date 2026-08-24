<template>
  <div class="liquid-palette-picker">
    <button
      ref="trigger"
      class="liquid-palette-picker__trigger"
      type="button"
      aria-label="切换颜色主题"
      title="颜色主题"
      :aria-expanded="String(open)"
      @click="toggle"
      @keydown.esc.prevent="close"
    >
      <span class="liquid-palette-picker__swatch" :data-palette-swatch="palette" />
    </button>
    <div
      ref="menu"
      class="liquid-palette-picker__menu"
      popover="manual"
      :style="menuStyle"
      @click.stop
    >
      <strong>颜色主题</strong>
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :class="{ 'is-selected': palette === option.value }"
        @click="choose(option.value)"
      >
        <span :data-palette-swatch="option.value" />
        {{ option.label }}
        <i v-if="palette === option.value" class="el-icon-check" />
      </button>
    </div>
  </div>
</template>

<script>
import { applyPalette, getThemeState } from '@/utils/theme'

export default {
  name: 'LiquidPalettePicker',
  data() {
    return {
      open: false,
      palette: getThemeState().palette,
      menuStyle: {},
      options: [
        { value: 'blue', label: '海蓝' },
        { value: 'violet', label: '紫罗兰' },
        { value: 'emerald', label: '翡翠' },
        { value: 'amber', label: '琥珀' }
      ]
    }
  },
  mounted() {
    document.addEventListener('click', this.handleOutside)
    window.addEventListener('resize', this.updatePosition)
  },
  beforeDestroy() {
    this.close()
    document.removeEventListener('click', this.handleOutside)
    window.removeEventListener('resize', this.updatePosition)
  },
  methods: {
    toggle() {
      if (this.open) this.close()
      else this.show()
    },
    show() {
      this.open = true
      this.$nextTick(() => {
        this.updatePosition()
        if (this.$refs.menu.showPopover) this.$refs.menu.showPopover()
      })
    },
    close() {
      if (!this.open) return
      this.open = false
      if (this.$refs.menu && this.$refs.menu.hidePopover) {
        try {
          this.$refs.menu.hidePopover()
        } catch (error) {
          // The browser may already have dismissed the popover.
        }
      }
    },
    choose(palette) {
      this.palette = applyPalette(palette).palette
      this.close()
    },
    updatePosition() {
      if (!this.open || !this.$refs.trigger) return
      const rect = this.$refs.trigger.getBoundingClientRect()
      this.menuStyle = {
        top: `${rect.bottom + 8}px`,
        right: `${Math.max(12, window.innerWidth - rect.right)}px`
      }
    },
    handleOutside(event) {
      if (!this.open) return
      if (this.$el.contains(event.target) || this.$refs.menu.contains(event.target)) return
      this.close()
    }
  }
}
</script>

<style scoped>
.liquid-palette-picker__trigger {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid var(--rim);
  border-radius: 50%;
  background: var(--glass-input);
  box-shadow: inset 0 1px 0 var(--spec), var(--shadow-soft);
  backdrop-filter: blur(16px);
}
.liquid-palette-picker__swatch,
.liquid-palette-picker__menu button > span {
  width: 18px;
  height: 18px;
  border: 2px solid var(--spec);
  border-radius: 50%;
  box-shadow: 0 2px 7px color-mix(in srgb, var(--accent) 28%, transparent);
}
[data-palette-swatch='blue'] { background: #0a7cff; }
[data-palette-swatch='violet'] { background: #8155e7; }
[data-palette-swatch='emerald'] { background: #078b6c; }
[data-palette-swatch='amber'] { background: #cf7100; }
.liquid-palette-picker__menu {
  position: fixed;
  z-index: 5000;
  width: 190px;
  margin: 0;
  padding: 8px;
  border: 1px solid var(--rim);
  border-radius: var(--r-md);
  color: var(--ink);
  background: linear-gradient(150deg, var(--spec-soft), transparent 46%),
    var(--glass-popover);
  box-shadow: var(--shadow), inset 0 1px 0 var(--spec);
  backdrop-filter: blur(30px) saturate(180%);
}
.liquid-palette-picker__menu > strong {
  display: block;
  padding: 7px 10px;
  color: var(--ink-3);
  font-size: 11px;
}
.liquid-palette-picker__menu button {
  display: grid;
  grid-template-columns: 24px 1fr 18px;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 6px 10px;
  border: 0;
  border-radius: 11px;
  color: var(--ink-2);
  background: transparent;
  text-align: left;
}
.liquid-palette-picker__menu button:hover,
.liquid-palette-picker__menu button.is-selected {
  color: var(--ink);
  background: var(--glass-soft);
}
</style>

<template>
  <div class="liquid-tabs" role="tablist" :aria-label="label">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      ref="tab"
      type="button"
      :class="{ on: activeValue === tab.value }"
      role="tab"
      :aria-selected="String(activeValue === tab.value)"
      :tabindex="activeValue === tab.value ? 0 : -1"
      @click="$emit('change', tab.value)"
      @keydown="handleKeydown($event, tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'LiquidTabs',
  model: {
    prop: 'activeValue',
    event: 'change'
  },
  props: {
    tabs: {
      type: Array,
      required: true,
      validator: (tabs) => tabs.every((tab) => tab && tab.value !== undefined && tab.label != null)
    },
    activeValue: { type: [String, Number], required: true },
    label: { type: String, default: '' }
  },
  methods: {
    handleKeydown(event, value) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const values = this.tabs.map((tab) => tab.value)
      const index = values.indexOf(value)
      let next
      if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = values.length - 1
      else next = (index + (event.key === 'ArrowRight' ? 1 : -1) + values.length) % values.length
      this.$emit('change', values[next])
      this.$nextTick(() => {
        const target = this.$refs.tab && this.$refs.tab[next]
        if (target) target.focus()
      })
    }
  }
}
</script>

// Shared tablist semantics for segmented `.liquid-tabs` controls: each button
// is a tab, selection follows aria-selected, and arrow keys move focus and
// activate tabs per WAI-ARIA. Panels are tracked by callers via activeValue.
export default {
  props: {
    activeValue: { type: [String, Number], required: true }
  },
  methods: {
    tabAttrs(value) {
      return {
        role: 'tab',
        'aria-selected': String(this.activeValue === value),
        tabindex: this.activeValue === value ? 0 : -1
      }
    },
    tabKeydown(event, values, select) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const index = values.indexOf(this.activeValue)
      let next
      if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = values.length - 1
      else next = (index + (event.key === 'ArrowRight' ? 1 : -1) + values.length) % values.length
      select(values[next])
      this.$nextTick(() => {
        const tabs = this.$el && this.$el.querySelectorAll
          ? this.$el.querySelectorAll('[role="tab"]')
          : []
        const target = Array.from(tabs).find((tab) => tab.getAttribute('aria-selected') === 'true')
        if (target) target.focus()
      })
    }
  }
}

// Shared form-control seam for native <input>/<textarea> elements rendered
// directly inside a LiquidFormItem. Registers the component so the form item's
// label targets this control, and derives the input's error association from
// the live form item state without replacing explicit accessible names.
export default {
  inject: { liquidFormItem: { default: null } },
  computed: {
    nativeControlAttrs() {
      const attrs = {}
      const item = this.liquidFormItem
      if (!item) return attrs
      if (item.label != null) attrs['aria-labelledby'] = item.labelId
      if (item.error) {
        attrs['aria-describedby'] = item.errorId
        attrs['aria-invalid'] = 'true'
      }
      return attrs
    }
  },
  mounted() { this.liquidFormItem?.addControl(this) },
  beforeDestroy() { this.liquidFormItem?.removeControl(this) }
}

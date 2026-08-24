// Keeps Liquid controls compatible with the current form adapter without
// coupling their implementation to ElementUI's private source modules.
export default {
  methods: {
    dispatch(componentName, eventName, params = []) {
      let parent = this.$parent || this.$root

      while (
        parent &&
        (!parent.$options || parent.$options.componentName !== componentName)
      ) {
        parent = parent.$parent
      }

      if (parent) parent.$emit(eventName, ...params)
    }
  }
}

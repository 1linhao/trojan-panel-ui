import { flattenNavigation } from "./contracts.js";
import { LiquidNavIcon } from "@liqui/liquid-ui";
const LiquidMobileNav = {
  name: "LiquidMobileNav",
  components: { LiquidNavIcon },
  props: { model: { type: Object, required: true } },
  computed: {
    items() {
      const byKey = new Map(flattenNavigation(this.model).map((item) => [item.key, item]));
      return this.model.mobileKeys.map((key) => byKey.get(key)).filter(Boolean);
    }
  },
  methods: {
    navigate(item) {
      if (!item.disabled) this.$emit("navigate", item.key);
    }
  },
  render(h) {
    return h("nav", {
      class: ["liquid-shell__mobile-nav", { "is-scrollable": this.items.length > 5 }],
      attrs: { "aria-label": "Mobile navigation" }
    }, this.items.map((item) => h("button", {
      key: item.key,
      class: ["liquid-shell__mobile-item", { "is-active": item.key === this.model.activeKey }],
      attrs: { type: "button", disabled: item.disabled, "aria-current": item.key === this.model.activeKey ? "page" : null },
      on: { click: () => this.navigate(item) }
    }, [
      item.icon ? h(LiquidNavIcon, { props: { name: item.icon, size: 18 }, attrs: { "aria-hidden": "true" } }) : null,
      h("span", item.mobileLabel)
    ])));
  }
};
export {
  LiquidMobileNav
};

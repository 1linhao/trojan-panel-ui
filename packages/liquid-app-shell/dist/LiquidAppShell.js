import { LiquidGlassSurface } from "@liqui/liquid-ui";
import { normalizeShellModel } from "./contracts.js";
import { LiquidMobileNav } from "./LiquidMobileNav.js";
import { LiquidSideNav } from "./LiquidSideNav.js";
import { LiquidTopbar } from "./LiquidTopbar.js";
const LiquidAppShell = {
  name: "LiquidAppShell",
  components: { LiquidGlassSurface, LiquidMobileNav, LiquidSideNav, LiquidTopbar },
  props: { model: { type: Object, required: true } },
  computed: {
    normalizedModel() {
      return normalizeShellModel(this.model);
    }
  },
  render(h) {
    var _a, _b, _c;
    const model = this.normalizedModel;
    const forwardSlots = {
      brand: this.$scopedSlots.brand,
      "navigation-item": this.$scopedSlots["navigation-item"]
    };
    return h("div", { class: "liquid-shell", attrs: { "aria-busy": String(model.busy) } }, [
      h(LiquidGlassSurface, { class: "liquid-shell__side-surface", props: { surface: "navigation", material: "frost", elevated: true } }, [
        h(LiquidSideNav, { props: { model }, scopedSlots: forwardSlots, on: { navigate: (key) => this.$emit("navigate", key) } })
      ]),
      h("main", { class: "liquid-shell__main" }, [
        h(LiquidGlassSurface, { class: "liquid-shell__topbar-surface", props: { surface: "navigation", elevated: true } }, [
          h(LiquidTopbar, {
            props: { model },
            scopedSlots: { "user-summary": this.$scopedSlots["user-summary"] },
            on: { logout: () => this.$emit("logout") }
          }, [
            h("template", { slot: "header-start" }, this.$slots["header-start"]),
            h("template", { slot: "header-actions" }, this.$slots["header-actions"])
          ])
        ]),
        h("section", { class: "liquid-shell__content" }, this.$slots.default)
      ]),
      h(LiquidGlassSurface, { class: "liquid-shell__mobile-surface", props: { surface: "navigation", material: "frost", elevated: true } }, [
        (_c = (_b = (_a = this.$scopedSlots)["mobile-navigation"]) == null ? void 0 : _b.call(_a, { model })) != null ? _c : h(LiquidMobileNav, {
          props: { model },
          on: { navigate: (key) => this.$emit("navigate", key) }
        })
      ]),
      h("div", { class: "liquid-shell__overlay-root" }, this.$slots["overlay-root"])
    ]);
  }
};
export {
  LiquidAppShell
};

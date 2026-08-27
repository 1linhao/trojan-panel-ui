import { LiquidNavIcon } from "@liqui/liquid-ui";
const LiquidSideNav = {
  name: "LiquidSideNav",
  components: { LiquidNavIcon },
  props: { model: { type: Object, required: true } },
  methods: {
    navigate(item) {
      if (!item.disabled) this.$emit("navigate", item.key);
    }
  },
  render(h) {
    var _a, _b, _c;
    const brand = (_c = (_b = (_a = this.$scopedSlots).brand) == null ? void 0 : _b.call(_a, { brand: this.model.brand })) != null ? _c : [
      h("span", { class: "liquid-shell__brand-mark", attrs: { "aria-hidden": "true" } }, this.model.brand.mark),
      h("span", { class: "liquid-shell__brand-copy" }, [
        h("strong", this.model.brand.name),
        this.model.brand.subtitle ? h("small", this.model.brand.subtitle) : null
      ])
    ];
    return h("aside", { class: "liquid-shell__side" }, [
      h("div", { class: "liquid-shell__brand" }, brand),
      h(
        "nav",
        { class: "liquid-shell__nav", attrs: { "aria-label": "Primary navigation" } },
        this.model.navGroups.map((group) => h("section", { key: group.key, class: "liquid-shell__nav-group" }, [
          group.label ? h("h2", { class: "liquid-shell__nav-label" }, group.label) : null,
          ...group.items.map((item) => {
            var _a2, _b2, _c2;
            return h("button", {
              key: item.key,
              class: ["liquid-shell__nav-item", { "is-active": item.key === this.model.activeKey }],
              attrs: { type: "button", disabled: item.disabled, "aria-current": item.key === this.model.activeKey ? "page" : null },
              on: { click: () => this.navigate(item) }
            }, [
              (_c2 = (_b2 = (_a2 = this.$scopedSlots)["navigation-item"]) == null ? void 0 : _b2.call(_a2, { item, active: item.key === this.model.activeKey })) != null ? _c2 : [
                item.icon ? h(LiquidNavIcon, { props: { name: item.icon }, attrs: { "aria-hidden": "true" } }) : null,
                h("span", item.label)
              ]
            ]);
          })
        ]))
      )
    ]);
  }
};
export {
  LiquidSideNav
};

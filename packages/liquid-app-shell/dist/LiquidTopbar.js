const LiquidTopbar = {
  name: "LiquidTopbar",
  props: { model: { type: Object, required: true } },
  render(h) {
    var _a, _b, _c;
    const user = this.model.user;
    return h("header", { class: "liquid-shell__topbar" }, [
      h("div", { class: "liquid-shell__header-start" }, [
        this.$slots["header-start"],
        h("h1", { class: "liquid-shell__title" }, this.model.title)
      ]),
      h("div", { class: "liquid-shell__header-actions" }, [
        this.$slots["header-actions"],
        user ? h("div", { class: "liquid-shell__user" }, [
          (_c = (_b = (_a = this.$scopedSlots)["user-summary"]) == null ? void 0 : _b.call(_a, { user })) != null ? _c : [
            h("span", { class: "liquid-shell__avatar", attrs: { "aria-hidden": "true" } }, user.initials),
            h("strong", user.name)
          ],
          h("button", {
            class: "liquid-shell__logout",
            attrs: { type: "button", "aria-label": "Log out" },
            on: { click: () => this.$emit("logout") }
          }, "↪")
        ]) : null
      ])
    ]);
  }
};
export {
  LiquidTopbar
};

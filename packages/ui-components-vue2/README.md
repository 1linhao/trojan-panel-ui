# @tp-ui/components-vue2

Vue 2 control and surface anatomy, interaction, accessibility, and geometry. The public surface exports `UiButton`, `UiInput`, `UiPanel`, `UiSheet`, `UiDialog`, and the selective `createVue2Components()` plugin.

`UiPanel` owns the common `auth | content | metric` panel recipes. `UiSheet`
owns in-page detail surfaces and `UiDialog` owns modal lifecycle, focus return,
Escape/backdrop closing, and overlay anatomy. Their stable animation Interface is
`motion-role`, `motion-key`, and `data-ui-part`; animation engines stay outside
the components package.

`createButtonInteractionController()` discovers native buttons and semantic
`role="button"` controls, then connects them through an injected Adapter. The
default CSS Adapter exposes the shared `data-ui-interaction="nav-lift"`
Interface; a future WAAPI or third-party animation module can implement
`connect()`, `disconnect()`, and `destroy()` without changing product Views.

Concrete color, blur, border, and shadow values belong to a material package. Components consume only the `@tp-ui/contracts` semantic attributes and custom properties.

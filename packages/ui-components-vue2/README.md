# @tp-ui/components-vue2

Vue 2 control anatomy, interaction, accessibility, and geometry. The initial Phase 1 surface exports `UiButton`, `UiInput`, and the selective `createVue2Components()` plugin.

`createButtonInteractionController()` discovers native buttons and semantic
`role="button"` controls, then connects them through an injected Adapter. The
default CSS Adapter exposes the shared `data-ui-interaction="nav-lift"`
Interface; a future WAAPI or third-party animation module can implement
`connect()`, `disconnect()`, and `destroy()` without changing product Views.

Concrete color, blur, border, and shadow values belong to a material package. Components consume only the `@tp-ui/contracts` semantic attributes and custom properties.

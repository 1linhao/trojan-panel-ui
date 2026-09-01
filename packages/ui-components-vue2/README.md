# @tp-ui/components-vue2

The composition root may pass `renderIcon` to `createVue2Components({ include, renderIcon })`. Dialog close actions then use the same renderer as application navigation and buttons. Direct `UiDialog` consumers may supply its `renderIcon` function prop; without an icon adapter the close action has a text label. Components do not import an icon package.

`include` defaults to an empty set; consumers must opt into every global registration. `dialogLabels` injects localized accessible action text while the standalone component retains a safe English fallback. Semantic props use the validators exported by `@tp-ui/contracts`.

Vue 2 control and surface anatomy, interaction, accessibility, and geometry. The public surface exports `UiButton`, `UiInput`, `UiPanel`, `UiSheet`, `UiDialog`, and the selective `createVue2Components()` plugin.

`UiPanel` owns the common `auth | content | metric` panel recipes without emitting legacy `glass`/`card` classes. `UiSheet`
owns in-page detail surfaces and `UiDialog` owns modal lifecycle, focus return,
Escape/backdrop closing, and overlay anatomy. Their stable animation Interface is
`motion-role`, `motion-key`, and `data-ui-part`; animation engines stay outside
the components package.

`motion-key` also provides an inert `--ui-view-transition-name` custom property.
A view-transition adapter may set `data-ui-view-transitions="active"` on an
ancestor for capture, then remove it in cleanup (including failure paths).
Do not leave capture enabled while idle: a non-`none` `view-transition-name`
creates a backdrop root and isolates descendant frosted-glass sampling.
Mobile dialogs remain vertically centered within the safe-area viewport;
long content scrolls inside the dialog body.

Dialogs default to a body portal (`appendToBody=false` opts out). A shared
stack owns topmost Escape, Tab focus containment, scroll locking, focus return
and parent-unmount cleanup. `role`/`describedBy` support alert dialogs without
a second implementation. `data-ui-overlay="modal"` and surface parts are public;
width uses `--ui-dialog-width` so mobile geometry can override it without priority hacks.
Control sizes are `sm/md/lg`; geometry consumes `data-ui-size`.

`createButtonInteractionController()` discovers native buttons and semantic
`role="button"` controls, then connects them through an injected Adapter. The
default CSS Adapter exposes the shared `data-ui-interaction="nav-lift"`
Interface; a future WAAPI or third-party animation module can implement
`connect()`, `disconnect()`, and `destroy()` without changing product Views.

Concrete color, blur, border, and shadow values belong to a material package. Components consume only the `@tp-ui/contracts` semantic attributes and custom properties.

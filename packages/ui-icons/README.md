# @tp-ui/icons

Small semantic icon registry with consistent view boxes and `currentColor` rendering. Icons are injected by the composition root and do not depend on components, layouts, or materials.

Navigation and action icons share `renderIcon(h, name, attrs?, vnodeData?)`: 24×24 view box, no fill, `currentColor` stroke, 2.35 stroke width, rounded ends and joins. `iconNames` lists supported semantic names. The renderer preserves Vue classes, styles and event bindings; `.app-icon--loading` is a motion hook, not a separate icon implementation.

The application uses `AppIcon` for controls and navigation, and passes `renderIcon` to `createVue2Components` for dialog actions. Button icons have no miniature background, padding, rounded tile or inset shadow of their own.

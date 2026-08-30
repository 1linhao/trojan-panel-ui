# Changelog

## Unreleased

- Center mobile dialogs within viewport safe areas while retaining body scrolling.
- Expose motion names as inert CSS custom properties; view-transition capture is
  opt-in through `data-ui-view-transitions="active"` on an ancestor so idle glass
  surfaces share the surrounding backdrop. Motion keys and roles are unchanged.

## Unreleased

- Added the shared button interaction controller, CSS Adapter, and nav-lift
  interaction stylesheet.
- Stabilized the translated hover boundary by tracking the resting hit area in
  the interaction controller.

## 0.1.0

- Accept a composition-root icon renderer for dialog actions, keeping icons independent from the component package.

- Added the first named Vue 2 components and selective plugin factory.

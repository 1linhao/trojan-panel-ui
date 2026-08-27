# @tp-ui/motion-native

Optional motion controller and semantic timing variables. The composition root injects this package into `createUiRuntime`; components and layouts consume only motion tokens and `data-ui-motion`.

Future animation engines can implement the same `apply(state)` and `getCapabilities()` interface. Existing product animations remain in place until their owning component is migrated.

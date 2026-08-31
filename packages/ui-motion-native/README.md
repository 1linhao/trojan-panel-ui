# @tp-ui/motion-native

Optional motion controller and semantic timing variables. The composition root injects this package into `createUiRuntime`; components and layouts consume only motion tokens and `data-ui-motion`.

Future animation engines can implement the same `apply(state)` and `getCapabilities()` interface.
Production transitions, spins and ambient drift consume shared timing tokens.
CSS follows the OS only before runtime resolution; explicit full/reduced/none
remain authoritative.

`afterTransition(element, callback)` schedules cleanup using computed CSS timing.
`scrollElementTo(element, to, { duration?, onComplete? })` uses the slow token by
default, cancels superseded scrolling and immediately completes in reduced/none mode.
Both return cancellation functions. The application keeps only a scrolling-target adapter.

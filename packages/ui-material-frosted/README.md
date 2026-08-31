# @tp-ui/material-frosted

Production-target frosted material tokens and controller. It applies theme/palette semantic attributes, browser chrome metadata, surface recipes, and a no-backdrop-filter fallback.

`production.css` owns the current application's light/dark palettes, semantic
status colors, charts, ambient colors, shadows and blur recipes without changing
their values. It preserves existing variable names as a compatibility profile;
the app no longer defines these colors in `prototype-runtime.scss`.
`material.css` remains the standalone lab profile; choose the appropriate profile
rather than loading competing recipes.

`overlay.css` only assigns variables through public semantic attributes.
All profiles are scoped to `data-ui-material="frosted"`; they cannot leak glass
into an explicitly selected flat material. Component geometry consumes the
variables. Application composition supplies only palette aliases and layout.

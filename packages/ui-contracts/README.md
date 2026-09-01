# @tp-ui/contracts

Framework-neutral semantic values, immutable ShellModel normalization, theme/material/motion runtime seams, and CSS custom-property contract shared by Trojan Panel UI resources.

`UI_CUSTOM_PROPERTIES` is the complete cross-package registry. The workspace architecture check rejects any `--ui-*` name used by a resource package unless it is registered here, and also rejects duplicate contract entries and package dependency cycles.

This package contains no Vue component, business route, role, API, or concrete material value. Import only the documented package exports.

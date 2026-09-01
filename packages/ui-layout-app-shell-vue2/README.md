# @tp-ui/layout-app-shell-vue2

Vue 2 application-shell geometry and responsive behavior. `UiAppShell` accepts an immutable ShellModel and emits only `navigate`, `logout`, and `action` intents.

Brand/icon/action/user content and localized accessibility labels are injected by the application composition layer. The Shell keeps active mobile navigation visible when the navigation row overflows; `showUser=false` lets an application provide its own profile/logout actions without a duplicate generic user action.

The production geometry uses the shared `1060px` desktop/mobile-navigation breakpoint. The active mobile item is revealed after navigation and viewport changes, while icon and navigation material recipes remain public contract parts rather than application selectors.

The package does not import Router, Vuex, authentication, roles, a component package, or a material package.

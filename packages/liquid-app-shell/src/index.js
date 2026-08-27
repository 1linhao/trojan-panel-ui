import { LiquidAppShell } from './LiquidAppShell.js'
import { LiquidMobileNav } from './LiquidMobileNav.js'
import { LiquidSideNav } from './LiquidSideNav.js'
import { LiquidTopbar } from './LiquidTopbar.js'

export { flattenNavigation, normalizeShellModel } from './contracts.js'
export { LiquidAppShell, LiquidMobileNav, LiquidSideNav, LiquidTopbar }

export function createLiquidAppShell() {
  const components = { LiquidAppShell, LiquidMobileNav, LiquidSideNav, LiquidTopbar }
  return {
    install(Vue) {
      Object.values(components).forEach((component) => Vue.component(component.name, component))
    }
  }
}

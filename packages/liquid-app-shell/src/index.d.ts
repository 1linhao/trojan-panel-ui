export interface BrandConfig { name: string; mark?: string; subtitle?: string }
export interface NavItem { key: string; label: string; mobileLabel?: string; icon?: string; disabled?: boolean }
export interface NavGroup { key: string; label?: string; items: NavItem[] }
export interface UserSummary { name: string; initials?: string }
export interface ShellModel {
  brand: BrandConfig
  title: string
  activeKey?: string
  navGroups: NavGroup[]
  mobileKeys?: string[]
  user?: UserSummary
  busy?: boolean
}
export function normalizeShellModel(input: ShellModel): Readonly<ShellModel>
export function flattenNavigation(model: ShellModel): NavItem[]
export function createLiquidAppShell(): { install(Vue: unknown): void }
export const LiquidAppShell: Record<string, unknown>
export const LiquidMobileNav: Record<string, unknown>
export const LiquidSideNav: Record<string, unknown>
export const LiquidTopbar: Record<string, unknown>

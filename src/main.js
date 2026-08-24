import Vue from 'vue'
import 'normalize.css/normalize.css'
import ElementUI from 'element-ui'
import '@/styles/element-variables.scss'
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/index.scss'
import App from './App'
import store from '@/store'
import router from '@/router'
import Cookies from 'js-cookie'
import '@/icons'
import '@/permission'
import i18n from '@/lang'
import { initializeTheme } from '@/utils/theme'
import LiquidNumberInput from '@/components/LiquidNumberInput'
import LiquidInput from '@/components/LiquidInput'
import LiquidSelect from '@/components/LiquidSelect'
import LiquidSwitch from '@/components/LiquidSwitch'
import LiquidButton from '@/components/LiquidButton'
import LiquidTag from '@/components/LiquidTag'
import LiquidDatePicker from '@/components/LiquidDatePicker'
import LiquidLoading from '@/directives/liquid-loading'

import VCA from '@vue/composition-api'
import JsonEditorVue from 'json-editor-vue'

Vue.use(VCA)
Vue.use(JsonEditorVue)

Vue.use(ElementUI, {
  size: Cookies.get('size') || 'small', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// Page templates depend on a stable Liquid Interface. ElementUI remains an
// internal Adapter for complex structural behaviour until those implementations
// can be replaced without touching every page again.
const liquidStructuralAdapters = {
  LiquidBreadcrumb: ElementUI.Breadcrumb,
  LiquidBreadcrumbItem: ElementUI.BreadcrumbItem,
  LiquidCard: ElementUI.Card,
  LiquidCol: ElementUI.Col,
  LiquidDescriptions: ElementUI.Descriptions,
  LiquidDescriptionsItem: ElementUI.DescriptionsItem,
  LiquidDialog: ElementUI.Dialog,
  LiquidDropdown: ElementUI.Dropdown,
  LiquidDropdownItem: ElementUI.DropdownItem,
  LiquidDropdownMenu: ElementUI.DropdownMenu,
  LiquidForm: ElementUI.Form,
  LiquidFormItem: ElementUI.FormItem,
  LiquidMenu: ElementUI.Menu,
  LiquidMenuItem: ElementUI.MenuItem,
  LiquidRow: ElementUI.Row,
  LiquidScrollbar: ElementUI.Scrollbar,
  LiquidSubmenu: ElementUI.Submenu,
  LiquidTable: ElementUI.Table,
  LiquidTableColumn: ElementUI.TableColumn,
  LiquidTooltip: ElementUI.Tooltip
}

Object.entries(liquidStructuralAdapters).forEach(([name, adapter]) => {
  Vue.component(name, adapter)
})

Vue.config.productionTip = false

Vue.component('LiquidNumberInput', LiquidNumberInput)
Vue.component('LiquidInput', LiquidInput)
Vue.component('LiquidSelect', LiquidSelect)
Vue.component('LiquidSwitch', LiquidSwitch)
Vue.component('LiquidButton', LiquidButton)
Vue.component('LiquidTag', LiquidTag)
Vue.component('LiquidDatePicker', LiquidDatePicker)
Vue.directive('liquid-loading', LiquidLoading)

initializeTheme()

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: (h) => h(App)
})

import Vue from 'vue'
import 'normalize.css/normalize.css'
import '@/styles/index.scss'
import App from './App'
import store from '@/store'
import router from '@/router'
import '@/icons'
import '@/permission'
import i18n from '@/lang'
import {
  configureLiquidTheme,
  getInitialTheme,
  initializeTheme
} from '@/utils/theme'
import { createLiquidUI } from '@liqui/liquid-ui'
import { createLiquidAppShell } from '@liqui/liquid-app-shell'
import '@liqui/liquid-ui/styles.css'
import '@liqui/liquid-app-shell/styles.css'
import LiquidLoading from '@/directives/liquid-loading'
import { structuralComponents } from '@/components/LiquidStructural'
import { Message, MessageBox, Notification } from '@/utils/liquid-feedback'

const liquidUI = createLiquidUI({ initialMode: getInitialTheme() })
Vue.use(liquidUI)
Vue.use(createLiquidAppShell())
configureLiquidTheme(liquidUI.theme)

Object.entries(structuralComponents).forEach(([name, component]) => {
  Vue.component(name, component)
})

Vue.config.productionTip = false

Vue.directive('liquid-loading', LiquidLoading)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$notify = Notification

initializeTheme()

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: (h) => h(App)
})

import Vue from 'vue'
import 'normalize.css/normalize.css'
import '@/styles/index.scss'
import App from './App'
import store from '@/store'
import router from '@/router'
import AppIcon from '@/components/AppIcon'
import LiquidInput from '@/components/LiquidInput'
import LiquidButton from '@/components/LiquidButton'
import '@/permission'
import i18n from '@/lang'
import { initializeTheme } from '@/utils/theme'
import LiquidLoading from '@/directives/liquid-loading'
import { structuralComponents } from '@/components/LiquidStructural'
import { Message, MessageBox, Notification } from '@/utils/liquid-feedback'
import { installUiInteractions } from '@/adapters/ui-interactions'
import { createVue2Components } from '@tp-ui/components-vue2'
import { renderIcon } from '@tp-ui/icons'

const LiquidNumberInput = () =>
  import('@/components/LiquidNumberInput')
const LiquidSelect = () =>
  import('@/components/LiquidSelect')
const LiquidSwitch = () =>
  import('@/components/LiquidSwitch')
const LiquidTag = () =>
  import('@/components/LiquidTag')
const LiquidDatePicker = () =>
  import('@/components/LiquidDatePicker')

Object.entries(structuralComponents).forEach(([name, component]) => {
  Vue.component(name, component)
})

Vue.use(
  createVue2Components({ include: ['UiPanel', 'UiSheet', 'UiDialog'], renderIcon })
)

Vue.config.productionTip = false

Vue.component('AppIcon', AppIcon)
Vue.component('LiquidNumberInput', LiquidNumberInput)
Vue.component('LiquidInput', LiquidInput)
Vue.component('LiquidSelect', LiquidSelect)
Vue.component('LiquidSwitch', LiquidSwitch)
Vue.component('LiquidButton', LiquidButton)
Vue.component('LiquidTag', LiquidTag)
Vue.component('LiquidDatePicker', LiquidDatePicker)
Vue.directive('liquid-loading', LiquidLoading)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$notify = Notification

initializeTheme()
document.documentElement.setAttribute('data-ui-material', 'frosted')
installUiInteractions()

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: (h) => h(App)
})

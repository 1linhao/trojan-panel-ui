import Vue from 'vue'
import 'normalize.css/normalize.css'
import '@/styles/index.scss'
import App from './App'
import store from '@/store'
import router from '@/router'
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
import { structuralComponents } from '@/components/LiquidStructural'
import { Message, MessageBox, Notification } from '@/utils/liquid-feedback'

import VCA from '@vue/composition-api'
import JsonEditorVue from 'json-editor-vue'

Vue.use(VCA)
Vue.use(JsonEditorVue)

Object.entries(structuralComponents).forEach(([name, component]) => {
  Vue.component(name, component)
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

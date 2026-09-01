import Vue from 'vue'
import 'normalize.css/normalize.css'
import '@/styles/index.scss'
import App from './App'
import store from '@/store'
import router from '@/router'
import '@/permission'
import i18n from '@/lang'
import { installProductionUi } from '@/adapters/trojan-panel-ui-composition'

installProductionUi(Vue)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: (h) => h(App)
})

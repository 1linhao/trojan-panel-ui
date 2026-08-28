<template>
  <div class="prototype-page">
    <ui-panel class="prototype-config-card" motion-key="system-config">
      <div class="card-head">
        <div>
          <span class="kicker">System Preferences</span>
          <h2>系统配置</h2>
        </div>
      </div>
      <div class="seg liquid-tabs" role="tablist" aria-label="系统配置">
        <button v-for="tab in tabs" :key="tab.name" type="button"
          :class="{ on: activeName === tab.name }" @click="activeName = tab.name">
          {{ tab.label }}
        </button>
      </div>
      <account v-if="activeName === 'account-config'" :system-config="systemConfig" />
      <email v-else-if="activeName === 'config-email'" :system-config="systemConfig" />
      <web-file v-else-if="activeName === 'config-web-file'" />
      <template-config v-else :system-config="systemConfig" />
    </ui-panel>
  </div>
</template>

<script>
import Account from './components/account'
import WebFile from './components/web-file'
import Email from './components/email'
import TemplateConfig from './components/template-config'
import { selectSystemByName } from '@/api/system'

export default {
  name: 'index',
  components: { Account, WebFile, Email, TemplateConfig },
  data() {
    return {
      activeName: 'account-config',
      tabs: [
        { name: 'account-config', label: '账号' },
        { name: 'config-email', label: '邮件' },
        { name: 'config-web-file', label: 'Web 文件' },
        { name: 'config-template-config', label: '订阅模板' }
      ],
      systemConfig: {
        emailEnable: 0,
        emailHost: undefined,
        emailPassword: undefined,
        emailPort: 0,
        emailUsername: undefined,
        expireWarnDay: 0,
        expireWarnEnable: 0,
        id: 1,
        registerEnable: 1,
        registerExpireDays: 0,
        registerQuota: 0,
        resetDownloadAndUploadMonth: 0,
        trafficRankEnable: 1,
        captchaEnable: 0,
        systemName: '',
        clashTemplateName: 'Default',
        clashRule: '',
        singBoxTunTemplateName: 'TUN',
        singBoxTun: '',
        singBoxTunEntity: {},
        singBoxOutboundTemplateName: 'Outbound only',
        singBoxOutbound: '',
        singBoxOutboundEntity: {},
        xrayTemplateName: 'Default',
        xrayTemplate: '',
        xrayTemplateEntity: {}
      }
    }
  },
  created() {
    this.selectDate()
  },
  methods: {
    selectDate() {
      selectSystemByName().then((response) => {
        this.systemConfig = response.data
        this.systemConfig.singBoxTunEntity = JSON.parse(
          this.systemConfig.singBoxTun
        )
        this.systemConfig.singBoxOutboundEntity = JSON.parse(
          this.systemConfig.singBoxOutbound
        )
        this.systemConfig.xrayTemplateEntity = JSON.parse(
          this.systemConfig.xrayTemplate
        )
      })
    }
  }
}
</script>

<style scoped></style>

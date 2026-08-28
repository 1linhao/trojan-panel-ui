<template>
  <div class="app-container">
    <liquid-form
      ref="dataForm"
      :rules="updateRules"
      :model="systemConfig"
      label-position="top"
    >
      <div class="general-settings">
        <liquid-form-item :label="$t('config.systemLogo')" prop="systemName">
          <upload-logo />
        </liquid-form-item>
        <liquid-form-item :label="$t('config.systemName')" prop="systemName">
          <liquid-input v-model="systemConfig.systemName" clearable />
        </liquid-form-item>
      </div>

      <div class="template-mode-switches">
        <div class="seg liquid-tabs" role="tablist" aria-label="订阅模板客户端">
          <button v-for="client in clients" :key="client.name" type="button"
            :class="{ on: activeClient === client.name }" @click="activeClient = client.name">
            {{ client.label }}
          </button>
        </div>
        <transition name="nested-mode-switch">
          <div
            v-if="activeClient === 'sing-box'"
            class="seg mode-switch"
            role="group"
            aria-label="sing-box 模板模式"
          >
            <button
              type="button"
              :class="{ on: activeSingBoxTemplate === 'tun' }"
              @click="activeSingBoxTemplate = 'tun'"
            >
              {{ systemConfig.singBoxTunTemplateName || 'TUN' }}
            </button>
            <button
              type="button"
              :class="{ on: activeSingBoxTemplate === 'outbound' }"
              @click="activeSingBoxTemplate = 'outbound'"
            >
              {{ systemConfig.singBoxOutboundTemplateName || 'Outbound only' }}
            </button>
          </div>
        </transition>
      </div>
      <template v-if="activeClient === 'clash-meta'">
          <liquid-form-item
            :label="$t('config.templateName')"
            prop="clashTemplateName"
          >
            <liquid-input v-model="systemConfig.clashTemplateName" clearable />
          </liquid-form-item>
          <liquid-form-item :label="$t('config.clashRule')" prop="clashRule">
            <liquid-input
              class="subscription-config-editor"
              v-model="systemConfig.clashRule"
              type="textarea"
              :autosize="{ minRows: 10, maxRows: 24 }"
              clearable
            />
          </liquid-form-item>
      </template>

      <template v-else-if="activeClient === 'sing-box'">
          <template v-if="activeSingBoxTemplate === 'tun'">
            <liquid-form-item
              :label="$t('config.templateName')"
              prop="singBoxTunTemplateName"
            >
              <liquid-input
                v-model="systemConfig.singBoxTunTemplateName"
                clearable
              />
            </liquid-form-item>
            <liquid-form-item
              :label="$t('config.singBoxTunTemplate')"
              prop="singBoxTun"
            >
              <liquid-json-editor
                class="subscription-config-editor"
                v-model="systemConfig.singBoxTunEntity"
              />
            </liquid-form-item>
          </template>

          <template v-else>
            <liquid-form-item
              :label="$t('config.templateName')"
              prop="singBoxOutboundTemplateName"
            >
              <liquid-input
                v-model="systemConfig.singBoxOutboundTemplateName"
                clearable
              />
            </liquid-form-item>
            <liquid-form-item
              :label="$t('config.singBoxOutboundTemplate')"
              prop="singBoxOutbound"
            >
              <liquid-json-editor
                class="subscription-config-editor"
                v-model="systemConfig.singBoxOutboundEntity"
              />
            </liquid-form-item>
          </template>
      </template>

      <template v-else>
          <liquid-form-item
            :label="$t('config.templateName')"
            prop="xrayTemplateName"
          >
            <liquid-input v-model="systemConfig.xrayTemplateName" clearable />
          </liquid-form-item>
          <liquid-form-item :label="$t('config.xrayTemplate')" prop="xrayTemplate">
            <liquid-json-editor
              class="subscription-config-editor"
              v-model="systemConfig.xrayTemplateEntity"
            />
          </liquid-form-item>
      </template>

      <liquid-form-item class="actions">
        <liquid-button type="primary" icon="liquid-icon--check" @click="updateData">
          {{ $t('table.confirm') }}
        </liquid-button>
      </liquid-form-item>
    </liquid-form>
  </div>
</template>

<script>
import { updateSystemById } from '@/api/system'
import UploadLogo from '@/components/UploadLogo'
import LiquidJsonEditor from '@/components/LiquidJsonEditor'

export default {
  name: 'TemplateConfigForm',
  components: { LiquidJsonEditor, UploadLogo },
  inject: {
    systemConfig: {
      from: 'systemConfigModel'
    }
  },
  data() {
    const nameRules = [
      {
        required: true,
        message: this.$t('valid.templateName'),
        trigger: ['change', 'blur']
      },
      {
        min: 1,
        max: 32,
        message: this.$t('valid.templateNameRange'),
        trigger: ['change', 'blur']
      }
    ]
    return {
      activeClient: 'clash-meta',
      clients: [
        { name: 'clash-meta', label: 'Clash.Meta' },
        { name: 'sing-box', label: 'sing-box' },
        { name: 'xray', label: 'Xray' }
      ],
      activeSingBoxTemplate: 'tun',
      updateRules: {
        systemName: [
          {
            required: true,
            message: this.$t('valid.systemName'),
            trigger: ['change', 'blur']
          },
          {
            min: 2,
            max: 32,
            message: this.$t('valid.systemNameRange'),
            trigger: ['change', 'blur']
          }
        ],
        clashTemplateName: nameRules,
        singBoxTunTemplateName: nameRules,
        singBoxOutboundTemplateName: nameRules,
        xrayTemplateName: nameRules,
        clashRule: [
          {
            min: 0,
            max: 102400,
            message: this.$t('valid.clashRuleRange'),
            trigger: ['change', 'blur']
          }
        ],
        singBoxTun: [
          {
            min: 0,
            max: 102400,
            message: this.$t('valid.singBoxRuleRange'),
            trigger: ['change', 'blur']
          }
        ],
        singBoxOutbound: [
          {
            min: 0,
            max: 102400,
            message: this.$t('valid.singBoxRuleRange'),
            trigger: ['change', 'blur']
          }
        ],
        xrayTemplate: [
          {
            min: 0,
            max: 10240,
            message: this.$t('valid.xrayTemplateRange'),
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    serializeEditor(field) {
      const value = this.systemConfig[field]
      const entity = typeof value === 'object' ? value : JSON.parse(value)
      return JSON.stringify(entity)
    },
    updateData() {
      try {
        this.systemConfig.singBoxTun = this.serializeEditor(
          'singBoxTunEntity'
        )
        this.systemConfig.singBoxOutbound = this.serializeEditor(
          'singBoxOutboundEntity'
        )
        this.systemConfig.xrayTemplate = this.serializeEditor(
          'xrayTemplateEntity'
        )
      } catch (error) {
        this.$message.error(this.$t('valid.jsonFormat').toString())
        return
      }
      this.$refs.dataForm.validate((valid) => {
        if (!valid) return
        updateSystemById(Object.assign({}, this.systemConfig)).then(() => {
          this.$nextTick(() => {
            this.$refs.dataForm.clearValidate()
          })
          this.$notify({
            title: 'Success',
            message: this.$t('confirm.modifySuccess'),
            type: 'success',
            duration: 2000
          })
        })
      })
    }
  }
}
</script>

<style scoped>
.general-settings {
  display: grid;
  grid-template-columns: minmax(160px, 240px) minmax(240px, 1fr);
  gap: 24px;
}

.template-mode-switches {
  display: grid;
  justify-items: start;
  gap: 12px;
  margin-bottom: 20px;
}

.template-mode-switches > .liquid-tabs {
  margin-bottom: 0;
}

.mode-switch {
  grid-row: 2;
}

.subscription-config-editor {
  --ui-editor-body-min-height: 320px;
  --ui-editor-mobile-body-min-height: 260px;
}

.nested-mode-switch-enter-active,
.nested-mode-switch-leave-active {
  transition: opacity var(--ui-motion-fast) var(--ui-motion-easing-standard),
    transform var(--ui-motion-fast) var(--ui-motion-easing-standard);
  transform-origin: top left;
}

.nested-mode-switch-enter,
.nested-mode-switch-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.actions {
  margin-top: 20px;
}

@media (max-width: 720px) {
  .general-settings {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>

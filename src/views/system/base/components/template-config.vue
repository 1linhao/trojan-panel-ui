<template>
  <div class="app-container">
    <el-form
      ref="dataForm"
      :rules="updateRules"
      :model="systemConfig"
      label-position="top"
    >
      <div class="general-settings">
        <el-form-item :label="$t('config.systemLogo')" prop="systemName">
          <upload-logo />
        </el-form-item>
        <el-form-item :label="$t('config.systemName')" prop="systemName">
          <el-input v-model="systemConfig.systemName" clearable />
        </el-form-item>
      </div>

      <el-tabs v-model="activeClient">
        <el-tab-pane label="Clash.Meta" name="clash-meta">
          <el-form-item
            :label="$t('config.templateName')"
            prop="clashTemplateName"
          >
            <el-input v-model="systemConfig.clashTemplateName" clearable />
          </el-form-item>
          <el-form-item :label="$t('config.clashRule')" prop="clashRule">
            <el-input
              v-model="systemConfig.clashRule"
              type="textarea"
              :autosize="{ minRows: 10, maxRows: 24 }"
              clearable
            />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="sing-box" name="sing-box">
          <el-radio-group v-model="activeSingBoxTemplate" class="mode-switch">
            <el-radio-button label="tun">
              {{ systemConfig.singBoxTunTemplateName || 'TUN' }}
            </el-radio-button>
            <el-radio-button label="outbound">
              {{ systemConfig.singBoxOutboundTemplateName || 'Outbound only' }}
            </el-radio-button>
          </el-radio-group>

          <template v-if="activeSingBoxTemplate === 'tun'">
            <el-form-item
              :label="$t('config.templateName')"
              prop="singBoxTunTemplateName"
            >
              <el-input
                v-model="systemConfig.singBoxTunTemplateName"
                clearable
              />
            </el-form-item>
            <el-form-item
              :label="$t('config.singBoxTunTemplate')"
              prop="singBoxTun"
            >
              <JsonEditorVue
                v-model="systemConfig.singBoxTunEntity"
                v-bind="systemConfig.singBoxTunEntity"
                mode="text"
              />
            </el-form-item>
          </template>

          <template v-else>
            <el-form-item
              :label="$t('config.templateName')"
              prop="singBoxOutboundTemplateName"
            >
              <el-input
                v-model="systemConfig.singBoxOutboundTemplateName"
                clearable
              />
            </el-form-item>
            <el-form-item
              :label="$t('config.singBoxOutboundTemplate')"
              prop="singBoxOutbound"
            >
              <JsonEditorVue
                v-model="systemConfig.singBoxOutboundEntity"
                v-bind="systemConfig.singBoxOutboundEntity"
                mode="text"
              />
            </el-form-item>
          </template>
        </el-tab-pane>

        <el-tab-pane label="Xray" name="xray">
          <el-form-item
            :label="$t('config.templateName')"
            prop="xrayTemplateName"
          >
            <el-input v-model="systemConfig.xrayTemplateName" clearable />
          </el-form-item>
          <el-form-item :label="$t('config.xrayTemplate')" prop="xrayTemplate">
            <JsonEditorVue
              v-model="systemConfig.xrayTemplateEntity"
              v-bind="systemConfig.xrayTemplateEntity"
              mode="text"
            />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>

      <el-form-item class="actions">
        <el-button type="primary" icon="el-icon-check" @click="updateData">
          {{ $t('table.confirm') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { updateSystemById } from '@/api/system'
import JsonEditorVue from 'json-editor-vue'
import UploadLogo from '@/components/UploadLogo'

export default {
  name: 'templateConfig',
  components: { JsonEditorVue, UploadLogo },
  props: {
    systemConfig: {
      type: Object,
      required: true
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

.mode-switch {
  margin-bottom: 20px;
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

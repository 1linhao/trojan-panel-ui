<template>
  <div class="app-container">
    <el-form
      ref="dataForm"
      :rules="updateRules"
      :model="systemConfig"
      label-position="left"
    >
      <el-form-item :label="$t('config.systemLogo')" prop="systemName">
        <upload-logo />
      </el-form-item>
      <el-form-item :label="$t('config.systemName')" prop="systemName">
        <el-input v-model="systemConfig.systemName" clearable />
      </el-form-item>
      <el-form-item :label="$t('config.clashRule')" prop="clashRule">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 8 }"
          v-model="systemConfig.clashRule"
          clearable
        />
      </el-form-item>
      <el-form-item :label="$t('config.singBoxRouteMode')">
        <el-select v-model="singBoxTemplateMode" class="filter-item">
          <el-option
            :label="$t('config.singBoxModeRule')"
            value="rule"
          />
          <el-option
            :label="$t('config.singBoxModeGlobal')"
            value="global"
          />
          <el-option
            :label="$t('config.singBoxModeDirect')"
            value="direct"
          />
        </el-select>
        <el-button class="filter-item" type="primary" @click="applySingBoxTemplate">
          {{ $t('config.applyTemplate') }}
        </el-button>
      </el-form-item>
      <el-form-item :label="$t('config.singBoxTemplate')" prop="singBoxRule">
        <JsonEditorVue
          v-model="systemConfig.singBoxRuleEntity"
          v-bind="systemConfig.singBoxRuleEntity"
          mode="text"
        />
      </el-form-item>
      <el-form-item :label="$t('config.xrayTemplate')" prop="xrayTemplate">
        <JsonEditorVue
          v-model="systemConfig.xrayTemplateEntity"
          v-bind="systemConfig.xrayTemplateEntity"
          mode="text"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="updateData()"
          >{{ $t('table.confirm') }}
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
    return {
      singBoxTemplateMode: 'rule',
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
        clashRule: [
          {
            min: 0,
            max: 102400,
            message: this.$t('valid.clashRuleRange'),
            trigger: ['change', 'blur']
          }
        ],
        singBoxRule: [
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
    applySingBoxTemplate() {
      this.systemConfig.singBoxRuleEntity = this.createSingBoxTemplate(
        this.singBoxTemplateMode
      )
    },
    createSingBoxTemplate(mode) {
      const template = {
        log: {
          level: 'info'
        },
        dns: {
          servers: [
            {
              type: 'local',
              tag: 'local'
            },
            {
              type: 'tls',
              tag: 'remote',
              server: '1.1.1.1',
              detour: 'PROXY'
            }
          ],
          final: 'remote'
        },
        inbounds: [
          {
            type: 'tun',
            tag: 'tun-in',
            address: ['172.19.0.1/30', 'fdfe:dcba:9876::1/126'],
            auto_route: true,
            strict_route: true,
            stack: 'mixed'
          }
        ],
        route: {
          rules: [
            {
              action: 'sniff'
            },
            {
              protocol: 'dns',
              action: 'hijack-dns'
            }
          ],
          auto_detect_interface: true,
          default_domain_resolver: 'local',
          final: 'PROXY'
        }
      }
      if (mode === 'rule') {
        template.route.rules.push(
          {
            ip_is_private: true,
            action: 'route',
            outbound: 'DIRECT'
          },
          {
            rule_set: ['geoip-cn', 'geosite-cn'],
            action: 'route',
            outbound: 'DIRECT'
          }
        )
        template.route.rule_set = [
          {
            type: 'remote',
            tag: 'geoip-cn',
            format: 'binary',
            url: 'https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs',
            download_detour: 'PROXY'
          },
          {
            type: 'remote',
            tag: 'geosite-cn',
            format: 'binary',
            url: 'https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-cn.srs',
            download_detour: 'PROXY'
          }
        ]
      } else if (mode === 'direct') {
        template.dns.servers[1].detour = 'DIRECT'
        template.route.final = 'DIRECT'
      }
      return template
    },
    updateData() {
      if (typeof this.systemConfig.singBoxRuleEntity !== 'object')
        this.systemConfig.singBoxRuleEntity = JSON.parse(
          this.systemConfig.singBoxRuleEntity
        )
      this.systemConfig.singBoxRule = JSON.stringify(
        this.systemConfig.singBoxRuleEntity
      )
      if (typeof this.systemConfig.xrayTemplateEntity !== 'object')
        this.systemConfig.xrayTemplateEntity = JSON.parse(
          this.systemConfig.xrayTemplateEntity
        )
      this.systemConfig.xrayTemplate = JSON.stringify(
        this.systemConfig.xrayTemplateEntity
      )
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.systemConfig)
          updateSystemById(tempData).then(() => {
            this.$nextTick(() => {
              this.$refs['dataForm'].clearValidate()
            })
            this.$notify({
              title: 'Success',
              message: this.$t('confirm.modifySuccess'),
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    }
  }
}
</script>

<style scoped></style>

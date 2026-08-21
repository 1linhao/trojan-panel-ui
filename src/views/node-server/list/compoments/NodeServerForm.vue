<template>
  <el-dialog
    :title="textMap[dialogStatus]"
    :visible="dialogVisible"
    @close="$emit('update:dialogVisible', false)"
    width="150"
  >
    <el-form
      ref="dataForm"
      :rules="dialogStatus === 'create' ? createRules : updateRules"
      :model="form"
      label-position="left"
    >
      <el-form-item :label="$t('table.nodeServerName')" prop="name">
        <el-input v-model="form.name" clearable />
      </el-form-item>
      <el-form-item :label="$t('table.nodeServerIp')" prop="ip">
        <el-input v-model="form.ip" clearable />
      </el-form-item>
      <el-form-item :label="$t('table.nodeServerGrpcPort')" prop="grpcPort">
        <el-input-number
          v-model.number="form.grpcPort"
          controls-position="right"
          type="number"
        />
      </el-form-item>
      <el-form-item :label="$t('kernel.tlsServerName')" prop="grpcTlsServerName">
        <el-input
          v-model="form.grpcTlsServerName"
          :placeholder="$t('kernel.tlsServerNamePlaceholder')"
          clearable
        />
      </el-form-item>
      <el-divider>{{ $t('traffic.limitSettings') }}</el-divider>
      <el-form-item :label="$t('traffic.period')">
        <el-select v-model="form.trafficPeriod">
          <el-option :label="$t('traffic.unlimited')" value="none" />
          <el-option :label="$t('traffic.day')" value="day" />
          <el-option :label="$t('traffic.month')" value="month" />
          <el-option :label="$t('traffic.year')" value="year" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.trafficPeriod !== 'none'" :label="$t('traffic.limitMode')">
        <el-radio-group v-model="form.trafficLimitMode">
          <el-radio label="combined">{{ $t('traffic.combined') }}</el-radio>
          <el-radio label="separate">{{ $t('traffic.split') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.trafficPeriod !== 'none' && form.trafficLimitMode === 'combined'" :label="$t('traffic.totalLimitGiB')">
        <el-input-number v-model="form.trafficTotalLimitGiB" :min="0" :max="8388607" />
      </el-form-item>
      <template v-if="form.trafficPeriod !== 'none' && form.trafficLimitMode === 'separate'">
        <el-form-item :label="$t('traffic.uploadLimitGiB')"><el-input-number v-model="form.trafficUploadLimitGiB" :min="0" :max="8388607" /></el-form-item>
        <el-form-item :label="$t('traffic.downloadLimitGiB')"><el-input-number v-model="form.trafficDownloadLimitGiB" :min="0" :max="8388607" /></el-form-item>
      </template>
      <el-alert v-if="form.trafficPeriod !== 'none'" :title="$t('traffic.zeroUnlimited')" type="info" :closable="false" />
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:dialogVisible', false)"
        >{{ $t('table.cancel') }}
      </el-button>
      <el-button
        type="primary"
        @click="dialogStatus === 'create' ? createData() : updateData()"
      >
        {{ $t('table.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createNodeServer, updateNodeServerById } from '@/api/node-server'

export default {
  name: 'NodeServerForm',
  props: {
    nodeServer: {
      type: Object,
      required: true
    },
    dialogStatus: {
      type: String,
      required: true
    },
    dialogVisible: {
      type: Boolean,
      required: true
    },
    getList: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      form: Object.assign({}, this.nodeServer),
      textMap: {
        update: this.$t('table.edit'),
        create: this.$t('table.add')
      },
      createRules: {
        ip: [
          {
            required: true,
            message: this.$t('valid.ip'),
            trigger: ['change', 'blur']
          },
          {
            min: 4,
            max: 64,
            message: this.$t('valid.ipRange'),
            trigger: ['change', 'blur']
          }
        ],
        name: [
          {
            required: true,
            message: this.$t('valid.nodeServerName'),
            trigger: ['change', 'blur']
          },
          {
            min: 2,
            max: 20,
            message: this.$t('valid.nodeServerNameRange'),
            trigger: ['change', 'blur']
          }
        ],
        grpcPort: [
          {
            required: true,
            message: this.$t('valid.nodePort'),
            trigger: ['change', 'blur']
          },
          {
            pattern:
              /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
            message: this.$t('valid.nodePortRange'),
            trigger: ['change', 'blur']
          }
        ],
        grpcTlsServerName: [
          {
            required: true,
            message: this.$t('kernel.tlsServerNameRequired'),
            trigger: ['change', 'blur']
          }
        ]
      },
      updateRules: {
        ip: [
          {
            required: true,
            message: this.$t('valid.ip'),
            trigger: ['change', 'blur']
          },
          {
            min: 4,
            max: 64,
            message: this.$t('valid.ipRange'),
            trigger: ['change', 'blur']
          }
        ],
        name: [
          {
            required: true,
            message: this.$t('valid.nodeServerName'),
            trigger: ['change', 'blur']
          },
          {
            min: 2,
            max: 20,
            message: this.$t('valid.nodeServerNameRange'),
            trigger: ['change', 'blur']
          }
        ],
        grpcPort: [
          {
            required: true,
            message: this.$t('valid.nodePort'),
            trigger: ['change', 'blur']
          },
          {
            pattern:
              /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
            message: this.$t('valid.nodePortRange'),
            trigger: ['change', 'blur']
          }
        ],
        grpcTlsServerName: [
          {
            min: 4,
            max: 253,
            message: this.$t('kernel.tlsServerNameRequired'),
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  watch: {
    nodeServer: {
      deep: true,
      handler(value) {
        this.form = Object.assign({}, value, {
          trafficTotalLimitGiB: (value.trafficTotalLimit || 0) / 1024 / 1024 / 1024,
          trafficUploadLimitGiB: (value.trafficUploadLimit || 0) / 1024 / 1024 / 1024,
          trafficDownloadLimitGiB: (value.trafficDownloadLimit || 0) / 1024 / 1024 / 1024
        })
      }
    }
  },
  methods: {
    toBytes(value) {
      return Math.round((value || 0) * 1024 * 1024 * 1024)
    },
    payload() {
      const data = Object.assign({}, this.form)
      data.trafficTotalLimit = data.trafficPeriod === 'none' ? 0 : this.toBytes(data.trafficTotalLimitGiB)
      data.trafficUploadLimit = data.trafficPeriod === 'none' ? 0 : this.toBytes(data.trafficUploadLimitGiB)
      data.trafficDownloadLimit = data.trafficPeriod === 'none' ? 0 : this.toBytes(data.trafficDownloadLimitGiB)
      delete data.trafficTotalLimitGiB
      delete data.trafficUploadLimitGiB
      delete data.trafficDownloadLimitGiB
      return data
    },
    clearValidate() {
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createNodeServer(this.payload()).then(() => {
            this.getList()
            this.$emit('update:dialogVisible', false)
            this.$notify({
              title: 'Success',
              message: this.$t('confirm.createSuccess'),
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = this.payload()
          updateNodeServerById(tempData).then(() => {
            this.getList()
            this.$emit('update:dialogVisible', false)
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

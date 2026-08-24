<template>
  <div v-if="formVisibleProps">
    <el-form-item
      label="serverName"
      prop="xrayStreamSettingsEntity.tlsSettings.serverName"
    >
      <liquid-input
        v-model="nodeProps.xrayStreamSettingsEntity.tlsSettings.serverName"
      />
    </el-form-item>
    <el-form-item
      label="allowInsecure"
      prop="xrayStreamSettingsEntity.tlsSettings.allowInsecure"
    >
      <liquid-switch
        v-model="nodeProps.xrayStreamSettingsEntity.tlsSettings.allowInsecure"
        active-color="#13ce66"
        inactive-color="#ff4949"
        :active-text="$t('table.yes').toString()"
        :inactive-text="$t('table.no').toString()"
        :active-value="true"
        :inactive-value="false"
      >
      </liquid-switch>
    </el-form-item>
    <el-form-item label="alpn" prop="xrayStreamSettingsEntity.tlsSettings.alpn">
      <liquid-select
        v-model="nodeProps.xrayStreamSettingsEntity.tlsSettings.alpn"
        multiple
      >
        <option
          v-for="item in alpns"
          :key="item"
          :label="item"
          :value="item"
        >
        </option>
      </liquid-select>
    </el-form-item>
    <el-form-item
      :label="$t('table.fingerprint').toString()"
      prop="fingerprint"
    >
      <liquid-select
        v-model="nodeProps.xrayStreamSettingsEntity.tlsSettings.fingerprint"
        controls-position="right"
      >
        <option
          :label="item"
          :value="item"
          :key="index"
          v-for="(item, index) in fingerprints"
        ></option>
      </liquid-select>
    </el-form-item>
  </div>
</template>

<script>
import { fingerprints } from '@/utils/node'

export default {
  name: 'XrayFormTls',
  props: {
    nodeProps: {
      type: Object,
      require: true
    },
    formVisibleProps: {
      type: Boolean,
      require: true
    }
  },
  data() {
    return {
      alpns: ['h2', 'http/1.1'],
      fingerprints
    }
  }
}
</script>

<style scoped></style>

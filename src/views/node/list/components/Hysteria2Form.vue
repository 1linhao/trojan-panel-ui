<template>
  <div v-if="formVisibleProps">
    <el-form-item
      :label="$t('table.hysteria2ObfsPassword').toString()"
      prop="hysteria2ObfsPassword"
    >
      <liquid-input v-model="nodeProps.hysteria2ObfsPassword" />
    </el-form-item>
    <el-form-item
      :label="$t('table.hysteria2UpMbps').toString()"
      prop="hysteria2UpMbps"
    >
      <liquid-number-input
        v-model.number="nodeProps.hysteria2UpMbps"
        controls-position="right"
        type="number"
      />
    </el-form-item>
    <el-form-item
      :label="$t('table.hysteria2DownMbps').toString()"
      prop="hysteria2DownMbps"
    >
      <liquid-number-input
        v-model.number="nodeProps.hysteria2DownMbps"
        controls-position="right"
        type="number"
      />
    </el-form-item>
    <el-form-item
      :label="$t('table.hysteria2ServerName').toString()"
      prop="hysteria2ServerName"
    >
      <liquid-input v-model="nodeProps.hysteria2ServerName" />
    </el-form-item>
    <el-form-item
      :label="$t('table.hysteria2PortHopping').toString()"
      prop="hysteria2PortHopping"
    >
      <liquid-input
        v-model="nodeProps.hysteria2PortHopping"
        placeholder="30000-50000"
      />
    </el-form-item>
    <el-form-item
      :label="$t('table.hysteria2HopInterval').toString()"
      prop="hysteria2HopInterval"
    >
      <liquid-number-input
        v-model.number="nodeProps.hysteria2HopInterval"
        controls-position="right"
        type="number"
        :min="5"
        :max="86400"
      />
    </el-form-item>
    <el-form-item
      :label="$t('table.hysteria2Insecure').toString()"
      prop="hysteria2Insecure"
    >
      <liquid-switch
        v-model="nodeProps.hysteria2Insecure"
        active-color="#13ce66"
        inactive-color="#ff4949"
        :active-text="$t('table.enable').toString()"
        :inactive-text="$t('table.disable').toString()"
        :active-value="1"
        :inactive-value="0"
      >
      </liquid-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'Hysteria2Form',
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
    return {}
  }
}
</script>

<style scoped></style>

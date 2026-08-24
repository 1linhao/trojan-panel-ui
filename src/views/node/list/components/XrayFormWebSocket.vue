<template>
  <div v-if="formVisibleProps">
    <liquid-form-item
      :label="$t('table.xrayStreamSettingsWsSettingsPath').toString()"
      prop="xrayStreamSettingsEntity.wsSettings.path"
    >
      <liquid-input v-model="nodeProps.xrayStreamSettingsEntity.wsSettings.path" />
    </liquid-form-item>
    <liquid-form-item
      label="WebSocket Host"
      prop="xrayStreamSettingsEntity.wsSettings.headers.Host"
    >
      <liquid-input
        v-model="nodeProps.xrayStreamSettingsEntity.wsSettings.headers.Host"
      />
    </liquid-form-item>
  </div>
</template>

<script>
export default {
  name: 'XrayFormWebSocket',
  props: {
    nodeProps: {
      type: Object,
      require: true
    },
    formVisibleProps: {
      type: Boolean,
      require: true
    }
  }
}
</script>

<style scoped></style>

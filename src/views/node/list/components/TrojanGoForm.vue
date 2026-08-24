<template>
  <div v-if="formVisibleProps">
    <liquid-form-item
      :label="$t('table.trojanGoSni').toString()"
      prop="trojanGoSni"
    >
      <liquid-input v-model="nodeProps.trojanGoSni" clearable />
    </liquid-form-item>
    <liquid-form-item
      :label="$t('table.trojanGoMuxEnable').toString()"
      prop="trojanGoMuxEnable"
    >
      <liquid-switch
        v-model="nodeProps.trojanGoMuxEnable"
        :active-text="$t('table.enable').toString()"
        :inactive-text="$t('table.disable').toString()"
        :active-value="1"
        :inactive-value="0"
      >
      </liquid-switch>
    </liquid-form-item>
    <liquid-form-item
      :label="$t('table.trojanGoWebsocketEnable').toString()"
      prop="trojanGoWebsocketEnable"
    >
      <liquid-switch
        v-model="nodeProps.trojanGoWebsocketEnable"
        :active-text="$t('table.enable').toString()"
        :inactive-text="$t('table.disable').toString()"
        :active-value="1"
        :inactive-value="0"
      >
      </liquid-switch>
    </liquid-form-item>
    <liquid-form-item
      :label="$t('table.trojanGoWebsocketPath').toString()"
      prop="trojanGoWebsocketPath"
      v-if="isTrojanGoEnableWebsocket(nodeProps)"
    >
      <liquid-input v-model="nodeProps.trojanGoWebsocketPath" clearable />
    </liquid-form-item>
    <liquid-form-item
      :label="$t('table.trojanGoWebsocketHost').toString()"
      prop="trojanGoWebsocketHost"
      v-if="isTrojanGoEnableWebsocket(nodeProps)"
    >
      <liquid-input v-model="nodeProps.trojanGoWebsocketHost" clearable />
    </liquid-form-item>
    <liquid-form-item
      :label="$t('table.trojanGoSsEnable').toString()"
      prop="trojanGoSsEnable"
      v-if="isTrojanGoEnableWebsocket(nodeProps)"
    >
      <liquid-switch
        v-model="nodeProps.trojanGoSsEnable"
        :active-text="$t('table.enable').toString()"
        :inactive-text="$t('table.disable').toString()"
        :active-value="1"
        :inactive-value="0"
      >
      </liquid-switch>
    </liquid-form-item>
    <liquid-form-item
      :label="$t('table.trojanGoSsMethod').toString()"
      prop="trojanGoSsMethod"
      v-if="
        isTrojanGoEnableWebsocket(nodeProps) && isTrojanGoEnableSs(nodeProps)
      "
    >
      <liquid-select
        v-model="nodeProps.trojanGoSsMethod"
        :placeholder="$t('table.trojanGoSsMethod').toString()"
        controls-position="right"
      >
        <option
          :label="item"
          :value="item"
          :key="item"
          v-for="item in trojanGoSsMethods"
        ></option>
      </liquid-select>
    </liquid-form-item>
    <liquid-form-item
      :label="$t('table.trojanGoSsPassword').toString()"
      prop="trojanGoSsPassword"
      v-if="
        isTrojanGoEnableWebsocket(nodeProps) && isTrojanGoEnableSs(nodeProps)
      "
    >
      <liquid-input v-model="nodeProps.trojanGoSsPassword" clearable />
    </liquid-form-item>
  </div>
</template>

<script>
import { isTrojanGoEnableSs, isTrojanGoEnableWebsocket } from '@/utils/node'

export default {
  name: 'TrojanGoForm',
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
      trojanGoSsMethods: [
        'AES-128-GCM',
        'AES-256-GCM',
        'CHACHA20-IETF-POLY1305'
      ]
    }
  },
  methods: {
    isTrojanGoEnableWebsocket,
    isTrojanGoEnableSs
  }
}
</script>

<style scoped></style>

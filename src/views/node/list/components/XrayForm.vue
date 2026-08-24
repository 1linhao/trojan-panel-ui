<template>
  <div v-if="formVisibleProps">
    <liquid-form-item
        :label="$t('table.xrayProtocol').toString()"
        prop="xrayProtocol"
    >
      <liquid-select
          v-model="nodeProps.xrayProtocol"
          controls-position="right"
          @change="xrayProtocolChange"
      >
        <option
            :label="item"
            :value="item"
            :key="index"
            v-for="(item, index) in xrayProtocols"
        ></option>
      </liquid-select>
    </liquid-form-item>
    <liquid-form-item
        :label="$t('table.xrayUotEnable').toString()"
        v-if="isXrayShadowsocks(nodeProps)"
    >
      <liquid-switch
          v-model="nodeProps.xrayUotEnable"
          :active-text="$t('table.enable').toString()"
          :inactive-text="$t('table.disable').toString()"
          :active-value="1"
          :inactive-value="0"
      />
      <div class="option-help">{{ $t('table.xrayUotHelp') }}</div>
    </liquid-form-item>
    <liquid-form-item
        :label="$t('table.xrayUotVersion').toString()"
        v-if="isXrayShadowsocks(nodeProps) && nodeProps.xrayUotEnable === 1"
    >
      <liquid-select v-model="nodeProps.xrayUotVersion">
        <option :value="1" label="1" />
        <option :value="2" label="2" />
      </liquid-select>
    </liquid-form-item>
    <liquid-form-item
        :label="$t('table.xrayXudpEnable').toString()"
        v-if="isXrayVless(nodeProps) || isXrayVmess(nodeProps)"
    >
      <liquid-switch
          v-model="nodeProps.xrayXudpEnable"
          :active-text="$t('table.enable').toString()"
          :inactive-text="$t('table.disable').toString()"
          :active-value="1"
          :inactive-value="0"
      />
    </liquid-form-item>
    <liquid-form-item
        :label="$t('table.xrayMuxEnable').toString()"
        v-if="isXrayVless(nodeProps) || isXrayVmess(nodeProps) || isXrayTrojan(nodeProps)"
    >
      <liquid-switch
          v-model="nodeProps.xrayMuxEnable"
          :active-text="$t('table.enable').toString()"
          :inactive-text="$t('table.disable').toString()"
          :active-value="1"
          :inactive-value="0"
      />
    </liquid-form-item>
    <liquid-form-item
        :label="$t('table.xrayStreamSettingsNetwork').toString()"
        prop="xrayStreamSettingsEntity.network"
        v-if="
        !(isXrayShadowsocksAEAD(nodeProps) || isXrayShadowsocks2022(nodeProps))
      "
    >
      <liquid-select
          v-model="nodeProps.xrayStreamSettingsEntity.network"
          controls-position="right"
          @change="xrayStreamSettingsNetworkChange"
      >
        <option
            :label="item"
            :value="item"
            :key="item"
            v-for="item in xrayStreamSettingsNetworks"
        ></option>
      </liquid-select>
    </liquid-form-item>

    <XrayFormWebSocket
        :form-visible-props="isXrayWs(nodeProps) && !isXrayShadowsocks(nodeProps)"
        :node-props="nodeProps"
    />

    <liquid-form-item
        :label="$t('table.xrayStreamSettingsSecurity').toString()"
        prop="xrayStreamSettingsEntity.security"
        v-if="!isXrayShadowsocks(nodeProps)"
    >
      <liquid-select
          v-model="nodeProps.xrayStreamSettingsEntity.security"
          controls-position="right"
          @change="xrayStreamSettingsSecurityChange"
      >
        <option
            :label="item"
            :value="item"
            :key="item"
            v-for="item in xrayStreamSettingsSecuritys"
        ></option>
      </liquid-select>
    </liquid-form-item>

    <XrayFormTls
        :form-visible-props="isXrayStreamSettingsSecurityTls(nodeProps)"
        :node-props="nodeProps"
    />

    <XrayFormReality
        :form-visible-props="isXrayStreamSettingsSecurityReality(nodeProps)"
        :node-props="nodeProps"
    />

    <liquid-form-item
        :label="$t('table.xrayFlow').toString()"
        prop="xrayFlow"
        v-if="showXrayFlow(nodeProps)"
    >
      <liquid-select v-model="nodeProps.xrayFlow">
        <option
            :label="item"
            :value="item"
            :key="index"
            v-for="(item, index) in xrayFlows"
        ></option>
      </liquid-select>
    </liquid-form-item>
    <liquid-form-item
        :label="$t('table.xraySSMethod').toString()"
        prop="xraySSMethod"
        v-if="
        isXrayShadowsocks(nodeProps) ||
        isXrayShadowsocksAEAD(nodeProps) ||
        isXrayShadowsocks2022(nodeProps)
      "
    >
      <liquid-select v-model="nodeProps.xraySSMethod">
        <option
            :label="item"
            :value="item"
            :key="index"
            v-for="(item, index) in xraySSMethods"
        ></option>
      </liquid-select>
    </liquid-form-item>
    <liquid-form-item
        :label="$t('table.xraySSNetwork').toString()"
        prop="xraySettingsEntity.network"
        v-if="
        isXrayShadowsocksAEAD(nodeProps) ||
        isXrayShadowsocks2022(nodeProps)
      "
    >
      <liquid-select
          v-model="nodeProps.xraySettingsEntity.network"
          controls-position="right"
      >
        <option
            :label="item"
            :value="item"
            :key="index"
            v-for="(item, index) in xraySettingsNetworks"
        ></option>
      </liquid-select>
    </liquid-form-item>
    <liquid-form-item
        :label="$t('table.xrayFallbacks').toString()"
        prop="xraySettingsEntity.fallbacks"
        v-if="showFallback(nodeProps)"
    >
      <liquid-tag
          v-for="(item, index) in nodeProps.xraySettingsEntity.fallbacks"
          :key="index"
          :disable-transitions="true"
          type="default"
          @close="deleteFallbackProps(item)"
          effect="dark"
          size="medium"
          closable
          @click="handleFallbackDetailProps(item)"
      >
        {{ item.dest }}
      </liquid-tag>
      <liquid-button
          class="liquid-add-button"
          type="primary"
          size="mini"
          icon="liquid-icon--plus"
          @click="handleCreateFallbackProps"
      ></liquid-button>
    </liquid-form-item>
    <liquid-form-item :label="$t('table.xraySocksUser').toString()" prop="xraySettingsEntity.accounts[0].user" v-if="isXraySocks(nodeProps)">
      <liquid-input v-model="nodeProps.xraySettingsEntity.accounts[0].user" />
    </liquid-form-item>
    <liquid-form-item :label="$t('table.xraySocksPass').toString()" prop="xraySettingsEntity.accounts[0].pass" v-if="isXraySocks(nodeProps)">
      <liquid-input v-model="nodeProps.xraySettingsEntity.accounts[0].pass" />
    </liquid-form-item>
    <liquid-form-item
        :label="$t('table.xraySocksUdp').toString()"
        prop="xraySettingsEntity.udp"
        v-if="isXraySocks(nodeProps)"
    >
      <liquid-switch
          v-model="nodeProps.xraySettingsEntity.udp"
          :active-text="$t('table.enable').toString()"
          :inactive-text="$t('table.disable').toString()"
          :active-value="true"
          :inactive-value="false"
      >
      </liquid-switch>
    </liquid-form-item>
  </div>
</template>

<script>
import {
  isXrayShadowsocks,
  isXrayShadowsocks2022,
  isXrayShadowsocksAEAD,
  isXraySocks,
  isXrayStreamSettingsSecurityReality,
  isXrayStreamSettingsSecurityTls, isXrayTrojan,
  isXrayVless,
  isXrayVmess,
  isXrayWs,
  showFallback,
  showXrayFlow
} from '@/utils/node.js'
import XrayFormReality from '@/views/node/list/components/XrayFormReality'
import XrayFormTls from '@/views/node/list/components/XrayFormTls'
import XrayFormWebSocket from '@/views/node/list/components/XrayFormWebSocket'

export default {
  name: 'XrayForm',
  components: {
    XrayFormWebSocket,
    XrayFormTls,
    XrayFormReality,
  },
  props: {
    nodeProps: {
      type: Object,
      require: true
    },
    formVisibleProps: {
      type: Boolean,
      require: true
    },
    handleCreateFallbackProps: {
      type: Function,
      required: true
    },
    handleFallbackDetailProps: {
      type: Function,
      required: true
    },
    deleteFallbackProps: {
      type: Function,
      required: true
    }
  },
  computed: {
    xrayStreamSettingsSecuritys() {
      let securitys = ['none', 'tls']
      if (isXrayVless(this.nodeProps)) {
        securitys.push('reality')
      }
      if (isXrayTrojan(this.nodeProps)) {
        for (let i = 0; i < securitys.length; i++) {
          if (securitys[i] === 'none') {
            securitys.splice(i, 1)
          }
        }
      }
      return securitys
    },
    xrayFlows() {
      return ['none', 'xtls-rprx-vision']
    },
    xrayStreamSettingsNetworks() {
      let xrayStreamSettingsNetworks = [
        'tcp',
        // 'kcp',
        'ws'
        // 'http',
        // 'domainsocket',
        // 'quic',
        // 'grpc'
      ]
      if (this.isXrayShadowsocks(this.nodeProps) ||
          this.isXraySocks(this.nodeProps)) {
        this.nodeProps.xrayStreamSettingsEntity.network = 'tcp'
        return ['tcp']
      } else {
        return xrayStreamSettingsNetworks
      }
    }
  },
  data() {
    return {
      xraySettingsNetworks: ['tcp', 'udp', 'tcp,udp'],
      xraySSMethods: [
        'none',
        'aes-128-gcm',
        'aes-256-gcm',
        'chacha20-ietf-poly1305',
        'xchacha20-ietf-poly1305'
      ],
      xrayProtocols: [
        // 'dokodemo-door',
        // 'http',
        'vless',
        'vmess',
        'trojan',
        'shadowsocks',
        'socks'
      ]
    }
  },
  methods: {
    isXraySocks,
    isXrayShadowsocks,
    isXrayShadowsocksAEAD,
    isXrayShadowsocks2022,
    isXrayVless,
    isXrayVmess,
    isXrayTrojan,
    showFallback,
    showXrayFlow,
    isXrayWs,
    isXrayStreamSettingsSecurityTls,
    isXrayStreamSettingsSecurityReality,
    xrayProtocolChange() {
      if (isXrayVless(this.nodeProps)) {
        this.nodeProps.xrayStreamSettingsEntity.security = 'reality'
      } else if (isXrayShadowsocks(this.nodeProps) || isXraySocks(this.nodeProps)) {
        this.nodeProps.xrayStreamSettingsEntity.security = 'none'
      } else {
        this.nodeProps.xrayStreamSettingsEntity.security = 'tls'
      }
    },
    xrayStreamSettingsNetworkChange() {
      if (this.nodeProps.xrayStreamSettingsEntity.network === 'ws') {
        this.nodeProps.xrayStreamSettingsEntity.security = 'tls'
      }
    },
    xrayStreamSettingsSecurityChange() {
      if (
          isXrayVless(this.nodeProps) &&
          (this.nodeProps.xrayStreamSettingsEntity.security === 'tls' ||
              this.nodeProps.xrayStreamSettingsEntity.security === 'reality')
      ) {
        this.nodeProps.xrayFlow = 'xtls-rprx-vision'
      } else {
        this.nodeProps.xrayFlow = 'none'
      }
    }
  }
}
</script>

<style scoped>
.liquid-tag + .liquid-tag {
  margin-left: 10px;
}

.liquid-button {
  margin-left: 10px;
}

.option-help {
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}
</style>

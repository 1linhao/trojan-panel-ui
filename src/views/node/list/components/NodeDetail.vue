<template>
  <div>
    <el-dialog
      append-to-body
      :title="$t('table.detail').toString()"
      :visible="dialogVisibleProps"
      @close="$emit('update:dialogVisibleProps', false)"
    >
      <el-form :model="nodeInfoProps" label-position="left">
        <el-form-item :label="$t('table.nodeName').toString()">
          <liquid-tag>{{ nodeInfoProps.name }}</liquid-tag>
        </el-form-item>
        <el-form-item :label="$t('table.nodeServer').toString()">
          <liquid-tag
            >{{ nodeServerFind(nodeServersProps, nodeInfoProps.nodeServerId) }}
          </liquid-tag>
        </el-form-item>
        <el-form-item :label="$t('table.nodeDomain').toString()">
          <liquid-tag>{{ nodeInfoProps.domain }}</liquid-tag>
        </el-form-item>
        <el-form-item :label="$t('table.nodePort').toString()">
          <liquid-tag>{{ nodeInfoProps.port }}</liquid-tag>
        </el-form-item>
        <el-form-item :label="$t('table.nodeType').toString()">
          <liquid-tag>
            {{ nodeTypeFind(nodeTypesProps, nodeInfoProps.nodeTypeId) }}
          </liquid-tag>
        </el-form-item>
        <el-form-item :label="$t('table.nodePriority').toString()">
          <liquid-tag>{{ nodeInfoProps.priority }}</liquid-tag>
        </el-form-item>
        <el-form-item :label="$t('table.nodeClients').toString()">
          <template
            v-if="nodeInfoProps.clients && nodeInfoProps.clients.length"
          >
            <liquid-tag
              v-for="client in nodeInfoProps.clients"
              :key="client"
              type="success"
            >
              {{ clientLabel(client) }}
            </liquid-tag>
          </template>
          <liquid-tag v-else type="info">{{ $t('table.nodeClientsNone') }}</liquid-tag>
        </el-form-item>
        <el-form-item :label="$t('table.password').toString()">
          <liquid-tag>{{ nodeInfoProps.password }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.uuid').toString()"
          v-if="showUUID(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.uuid }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.alterId').toString()"
          v-if="showAlterId(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.alterId }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xrayProtocol').toString()"
          v-if="isXray(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.xrayProtocol }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xrayStreamSettingsNetwork').toString()"
          v-if="isXray(nodeInfoProps) && !isXrayShadowsocks(nodeInfoProps)"
        >
          <liquid-tag>
            {{ nodeInfoProps.xrayStreamSettingsEntity.network }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xrayStreamSettingsWsSettingsPath').toString()"
          v-if="isXrayWs(nodeInfoProps) && !isXrayShadowsocks(nodeInfoProps)"
        >
          <liquid-tag
            >{{ nodeInfoProps.xrayStreamSettingsEntity.wsSettings.path }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          label="WebSocket Host"
          v-if="isXrayWs(nodeInfoProps) && !isXrayShadowsocks(nodeInfoProps)"
        >
          <liquid-tag
            >{{
              nodeInfoProps.xrayStreamSettingsEntity.wsSettings.headers.Host
            }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xrayStreamSettingsSecurity').toString()"
          v-if="isXray(nodeInfoProps) && !isXrayShadowsocks(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.xrayStreamSettingsEntity.security }}</liquid-tag>
        </el-form-item>
        <el-form-item
          label="serverName"
          v-if="isXrayStreamSettingsSecurityTls(nodeInfoProps)"
        >
          <liquid-tag
            >{{ nodeInfoProps.xrayStreamSettingsEntity.tlsSettings.serverName }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          label="alpn"
          v-if="isXrayStreamSettingsSecurityTls(nodeInfoProps)"
        >
          <liquid-tag
            v-for="(item, index) in nodeInfoProps.xrayStreamSettingsEntity
              .tlsSettings.alpn"
            :key="index"
            :disable-transitions="true"
            type="success"
            effect="dark"
            size="medium"
          >
            {{ item }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          label="allowInsecure"
          v-if="isXrayStreamSettingsSecurityTls(nodeInfoProps)"
        >
          <liquid-tag
            >{{
              nodeInfoProps.xrayStreamSettingsEntity.tlsSettings.allowInsecure
            }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.fingerprint').toString()"
          v-if="isXrayStreamSettingsSecurityTls(nodeInfoProps)"
        >
          <liquid-tag
            >{{
              nodeInfoProps.xrayStreamSettingsEntity.tlsSettings.fingerprint
            }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          label="dest"
          v-if="isXrayStreamSettingsSecurityReality(nodeInfoProps)"
        >
          <liquid-tag
            >{{ nodeInfoProps.xrayStreamSettingsEntity.realitySettings.dest }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          label="xver"
          v-if="isXrayStreamSettingsSecurityReality(nodeInfoProps)"
        >
          <liquid-tag
            >{{ nodeInfoProps.xrayStreamSettingsEntity.realitySettings.xver }}
          </liquid-tag>
        </el-form-item>

        <el-form-item
          label="serverNames"
          v-if="isXrayStreamSettingsSecurityReality(nodeInfoProps)"
        >
          <liquid-tag
            v-for="(item, index) in nodeInfoProps.xrayStreamSettingsEntity
              .realitySettings.serverNames"
            :key="index"
            :disable-transitions="true"
            type="success"
            effect="dark"
            size="medium"
          >
            {{ item }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.fingerprint').toString()"
          v-if="isXrayStreamSettingsSecurityReality(nodeInfoProps)"
        >
          <liquid-tag
            >{{
              nodeInfoProps.xrayStreamSettingsEntity.realitySettings.fingerprint
            }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          label="publicKey"
          v-if="isXrayStreamSettingsSecurityReality(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.realityPbk }}</liquid-tag>
        </el-form-item>
        <el-form-item
          label="privateKey"
          v-if="isXrayStreamSettingsSecurityReality(nodeInfoProps)"
        >
          <liquid-tag
            >{{
              nodeInfoProps.xrayStreamSettingsEntity.realitySettings.privateKey
            }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          label="shortIds"
          v-if="isXrayStreamSettingsSecurityReality(nodeInfoProps)"
        >
          <liquid-tag
            v-for="(item, index) in nodeInfoProps.xrayStreamSettingsEntity
              .realitySettings.shortIds"
            :key="index"
            :disable-transitions="true"
            type="success"
            effect="dark"
            size="medium"
          >
            {{ item }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          label="spiderX"
          v-if="isXrayStreamSettingsSecurityReality(nodeInfoProps)"
        >
          <liquid-tag
            >{{
              nodeInfoProps.xrayStreamSettingsEntity.realitySettings.spiderX
            }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xrayFlow').toString()"
          v-if="showXrayFlow(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.xrayFlow }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xraySSMethod').toString()"
          v-if="isXrayShadowsocks(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.xraySSMethod }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xraySSNetwork').toString()"
          v-if="isXrayShadowsocks(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.xraySettingsEntity.network }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xrayUotEnable').toString()"
          v-if="isXrayShadowsocks(nodeInfoProps)"
        >
          <liquid-tag>{{ enableComputed(nodeInfoProps.xrayUotEnable) }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xrayUotVersion').toString()"
          v-if="
            isXrayShadowsocks(nodeInfoProps) &&
            nodeInfoProps.xrayUotEnable === 1
          "
        >
          <liquid-tag>{{ nodeInfoProps.xrayUotVersion }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xrayXudpEnable').toString()"
          v-if="
            nodeInfoProps.xrayProtocol === 'vless' ||
            nodeInfoProps.xrayProtocol === 'vmess'
          "
        >
          <liquid-tag>{{ enableComputed(nodeInfoProps.xrayXudpEnable) }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xrayMuxEnable').toString()"
          v-if="
            ['vless', 'vmess', 'trojan'].includes(nodeInfoProps.xrayProtocol)
          "
        >
          <liquid-tag>{{ enableComputed(nodeInfoProps.xrayMuxEnable) }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xraySocksUser').toString()"
          v-if="isXraySocks(nodeInfoProps)"
        >
          <liquid-tag>{{
            nodeInfoProps.xraySettingsEntity.accounts[0].user
          }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xraySocksPass').toString()"
          v-if="isXraySocks(nodeInfoProps)"
        >
          <liquid-tag>{{
            nodeInfoProps.xraySettingsEntity.accounts[0].pass
          }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xraySocksUdp').toString()"
          v-if="isXraySocks(nodeInfoProps)"
        >
          <liquid-tag>{{
            enableComputed(nodeInfoProps.xraySettingsEntity.udp)
          }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.xrayFallbacks').toString()"
          v-if="showFallback(nodeInfoProps)"
        >
          <liquid-tag
            v-for="(item, index) in nodeInfoProps.xraySettingsEntity.fallbacks"
            :key="index"
            :disable-transitions="true"
            type="success"
            effect="dark"
            size="medium"
            @click="handleFallbackDetail(item)"
          >
            {{ item.dest }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.trojanGoSni').toString()"
          v-if="isTrojanGo(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.trojanGoSni }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.trojanGoMuxEnable').toString()"
          v-if="isTrojanGo(nodeInfoProps)"
        >
          <liquid-tag>
            {{ enableComputed(nodeInfoProps.trojanGoMuxEnable) }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.trojanGoWebsocketEnable').toString()"
          v-if="isTrojanGo(nodeInfoProps)"
        >
          <liquid-tag>
            {{ enableComputed(nodeInfoProps.trojanGoWebsocketEnable) }}
          </liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.trojanGoWebsocketPath').toString()"
          v-if="isTrojanGoEnableWebsocket(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.trojanGoWebsocketPath }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.trojanGoWebsocketHost').toString()"
          v-if="isTrojanGoEnableWebsocket(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.trojanGoWebsocketHost }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.trojanGoSsEnable').toString()"
          v-if="isTrojanGoEnableWebsocket(nodeInfoProps)"
        >
          <liquid-tag>{{ enableComputed(nodeInfoProps.trojanGoSsEnable) }} </liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.trojanGoSsMethod').toString()"
          v-if="
            isTrojanGoEnableWebsocket(nodeInfoProps) &&
            isTrojanGoEnableSs(nodeInfoProps)
          "
        >
          <liquid-tag>{{ nodeInfoProps.trojanGoSsMethod }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.trojanGoSsPassword').toString()"
          v-if="
            isTrojanGoEnableWebsocket(nodeInfoProps) &&
            isTrojanGoEnableSs(nodeInfoProps)
          "
        >
          <liquid-tag>{{ nodeInfoProps.trojanGoSsPassword }}</liquid-tag>
        </el-form-item>

        <el-form-item
          :label="$t('table.hysteriaProtocol').toString()"
          v-if="isHysteria(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.hysteriaProtocol }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteriaObfs').toString()"
          v-if="isHysteria(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.hysteriaObfs }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteriaUpMbps').toString()"
          v-if="isHysteria(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.hysteriaUpMbps }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteriaDownMbps').toString()"
          v-if="isHysteria(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.hysteriaDownMbps }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteriaServerName').toString()"
          v-if="isHysteria(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.hysteriaServerName }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteriaInsecure').toString()"
          v-if="isHysteria(nodeInfoProps)"
        >
          <liquid-tag>{{ enableComputed(nodeInfoProps.hysteriaInsecure) }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteriaFastOpen').toString()"
          v-if="isHysteria(nodeInfoProps)"
        >
          <liquid-tag>{{ enableComputed(nodeInfoProps.hysteriaFastOpen) }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteria2ObfsPassword').toString()"
          v-if="isHysteria2(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.hysteria2ObfsPassword }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteria2UpMbps').toString()"
          v-if="isHysteria2(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.hysteria2UpMbps }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteria2DownMbps').toString()"
          v-if="isHysteria2(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.hysteria2DownMbps }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteria2ServerName').toString()"
          v-if="isHysteria2(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.hysteria2ServerName }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteria2PortHopping').toString()"
          v-if="isHysteria2(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.hysteria2PortHopping }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteria2HopInterval').toString()"
          v-if="isHysteria2(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.hysteria2HopInterval }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.hysteria2Insecure').toString()"
          v-if="isHysteria2(nodeInfoProps)"
        >
          <liquid-tag>{{ enableComputed(nodeInfoProps.hysteria2Insecure) }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.naiveProxyUsername').toString()"
          v-if="isNaiveProxy(nodeInfoProps)"
        >
          <liquid-tag>{{ nodeInfoProps.naiveProxyUsername }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.naiveUotEnable').toString()"
          v-if="isNaiveProxy(nodeInfoProps)"
        >
          <liquid-tag>{{ enableComputed(nodeInfoProps.naiveUotEnable) }}</liquid-tag>
        </el-form-item>
        <el-form-item
          :label="$t('table.naiveUotVersion').toString()"
          v-if="
            isNaiveProxy(nodeInfoProps) && nodeInfoProps.naiveUotEnable === 1
          "
        >
          <liquid-tag>v{{ nodeInfoProps.naiveUotVersion }}</liquid-tag>
        </el-form-item>
        <el-form-item v-if="isHysteria(nodeInfoProps)">
          <aside>
            {{ $t('table.hysteriaTip') }}
          </aside>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <liquid-button
          type="primary"
          @click="$emit('update:dialogVisibleProps', false)"
          >{{ $t('table.confirm') }}
        </liquid-button>
      </div>
    </el-dialog>

    <FallbackInfo
      :dialog-visible-props.sync="dialogDetailFallbackDetailVisible"
      :fallback-prpops="fallback"
    />
  </div>
</template>

<script>
import FallbackInfo from '@/views/node/list/components/FallbackInfo'
import {
  isHysteria,
  isHysteria2,
  isNaiveProxy,
  isTrojanGo,
  isTrojanGoEnableSs,
  isTrojanGoEnableWebsocket,
  isXray,
  isXrayShadowsocks,
  isXraySocks,
  isXrayStreamSettingsSecurityReality,
  isXrayStreamSettingsSecurityTls,
  isXrayWs,
  nodeServerFind,
  nodeTypeFind,
  showAlterId,
  showFallback,
  showUUID,
  showXrayFlow
} from '@/utils/node'

export default {
  name: 'NodeDetail',
  components: { FallbackInfo },
  props: {
    dialogVisibleProps: {
      type: Boolean,
      required: true
    },
    nodeInfoProps: {
      type: Object,
      required: true
    },
    nodeServersProps: {
      type: Array,
      required: true
    },
    nodeTypesProps: {
      type: Array,
      required: true
    }
  },
  computed: {
    enableComputed() {
      return function (enable) {
        return enable && (enable === true || enable === 1)
          ? this.$t('table.enable')
          : this.$t('table.disable')
      }
    }
  },
  data() {
    return {
      fallback: {
        name: '',
        alpn: '',
        path: undefined,
        dest: '80',
        xver: 0
      },
      dialogDetailFallbackDetailVisible: false
    }
  },
  methods: {
    isXraySocks,
    isXray,
    isXrayShadowsocks,
    isXrayWs,
    showXrayFlow,
    showFallback,
    isTrojanGo,
    isTrojanGoEnableWebsocket,
    isTrojanGoEnableSs,
    isHysteria,
    isHysteria2,
    isNaiveProxy,
    nodeServerFind,
    nodeTypeFind,
    isXrayStreamSettingsSecurityTls,
    isXrayStreamSettingsSecurityReality,
    showUUID,
    showAlterId,
    clientLabel(client) {
      return (
        {
          'sing-box': 'sing-box',
          'clash-meta': 'Clash.Meta',
          v2ray: 'V2Ray',
          shadowrocket: 'Shadowrocket'
        }[client] || client
      )
    },
    handleFallbackDetail(fallback) {
      this.dialogDetailFallbackDetailVisible = true
      this.fallback = fallback
    }
  }
}
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}

.el-button {
  margin-left: 10px;
}
</style>

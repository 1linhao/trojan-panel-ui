<template>
  <div class="app-container">
    <el-alert
      :title="$t('kernel.manualOnly')"
      type="info"
      :closable="false"
      show-icon
      class="section"
    />

    <el-card v-if="batchMode" class="section">
      <div slot="header">{{ $t('kernel.batchUpgrade') }}</div>
      <el-form label-width="150px">
        <el-form-item :label="$t('kernel.nodes')">
          <el-select v-model="selectedNodeIds" multiple filterable style="width: 100%">
            <el-option
              v-for="server in servers"
              :key="server.id"
              :label="server.name"
              :value="server.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('kernel.canary')">
          <el-select v-model="canaryNodeId" clearable>
            <el-option
              v-for="server in selectedServers"
              :key="server.id"
              :label="server.name"
              :value="server.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="!batchMode" v-loading="inventoryLoading" class="section">
      <div slot="header">
        {{ $t('kernel.inventory') }}
        <el-button size="mini" style="float: right" @click="loadInventory">
          {{ $t('kernel.refreshInventory') }}
        </el-button>
      </div>
      <el-descriptions v-if="inventory" :column="2" border>
        <el-descriptions-item :label="$t('kernel.platform')">
          {{ inventory.os }}/{{ inventory.arch }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('kernel.transport')">
          {{ currentServer.grpcTlsMode || 'legacy' }}
          <el-button
            v-if="currentServer.grpcTlsMode !== 'mtls'"
            type="warning"
            size="mini"
            @click="enableMTLS"
          >
            {{ $t('kernel.probeMTLS') }}
          </el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="section">
      <div slot="header">
        {{ $t('kernel.managedKernels') }}
        <el-button size="mini" style="float: right" @click="loadReleases(true)">
          {{ $t('kernel.refreshReleases') }}
        </el-button>
      </div>
      <el-table :data="kernelRows" border>
        <el-table-column prop="name" :label="$t('kernel.kernel')" width="130" />
        <el-table-column :label="$t('kernel.currentVersion')" min-width="140">
          <template slot-scope="{ row }">{{ row.currentVersion || '-' }}</template>
        </el-table-column>
        <el-table-column :label="$t('kernel.channel')" width="150">
          <template slot-scope="{ row }">
            <el-select v-model="row.targetChannel" size="mini" @change="row.targetVersion = ''">
              <el-option :label="$t('kernel.stable')" value="stable" />
              <el-option :label="$t('kernel.prerelease')" value="prerelease" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="$t('kernel.targetVersion')" min-width="180">
          <template slot-scope="{ row }">
            <el-select v-model="row.targetVersion" size="mini" filterable>
              <el-option
                v-for="release in releases[row.key][row.targetChannel]"
                :key="release.version"
                :label="release.version"
                :value="release.version"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="$t('kernel.sha256')" min-width="220">
          <template slot-scope="{ row }">
            <span class="hash">{{ row.currentSha256 || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('kernel.usage')" width="100">
          <template slot-scope="{ row }">
            <el-tag :type="row.inUse ? 'success' : 'info'">
              {{ row.inUse ? $t('kernel.inUse') : $t('kernel.notInUse') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="!batchMode" :label="$t('kernel.rollback')" min-width="220">
          <template slot-scope="{ row }">
            <el-button
              v-for="version in row.rollbackVersions"
              :key="version.version"
              size="mini"
              @click="submitSingle(row, version.version, version.channelName, 'rollback')"
            >
              {{ version.version }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.actions')" width="120">
          <template slot-scope="{ row }">
            <el-button
              type="primary"
              size="mini"
              :disabled="!row.targetVersion || !row.supported"
              @click="batchMode ? toggleTarget(row) : submitSingle(row, row.targetVersion, row.targetChannel, 'install')"
            >
              {{ batchMode && row.selected ? $t('kernel.selected') : $t('kernel.upgrade') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button
        v-if="batchMode"
        type="primary"
        class="submit"
        :disabled="!canSubmitBatch"
        @click="submitBatch"
      >
        {{ $t('kernel.createBatchTask') }}
      </el-button>
    </el-card>

    <el-card v-if="task" class="section">
      <div slot="header">
        {{ $t('kernel.task') }} #{{ task.id }}
        <el-tag>{{ statusLabel(task.status) }}</el-tag>
      </div>
      <el-table :data="task.items || []" border>
        <el-table-column prop="nodeServerName" :label="$t('kernel.node')" />
        <el-table-column prop="kernel" :label="$t('kernel.kernel')" />
        <el-table-column prop="fromVersion" :label="$t('kernel.fromVersion')" />
        <el-table-column prop="targetVersion" :label="$t('kernel.targetVersion')" />
        <el-table-column :label="$t('kernel.stage')">
          <template slot-scope="{ row }">{{ stageLabel(row.stage) }}</template>
        </el-table-column>
        <el-table-column prop="error" :label="$t('kernel.error')" min-width="220" />
      </el-table>
      <el-button
        v-if="task.status === 'failed' || task.status === 'partial'"
        type="warning"
        class="submit"
        @click="retryTask"
      >
        {{ $t('kernel.retryFailed') }}
      </el-button>
    </el-card>

    <el-card class="section">
      <div slot="header">{{ $t('kernel.taskHistory') }}</div>
      <el-table :data="taskHistory" border>
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="operatorName" :label="$t('kernel.operator')" />
        <el-table-column :label="$t('table.status')">
          <template slot-scope="{ row }">{{ statusLabel(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="$t('table.createTime')" />
        <el-table-column :label="$t('table.actions')" width="100">
          <template slot-scope="{ row }">
            <el-button size="mini" @click="openTask(row.id)">
              {{ $t('kernel.viewTask') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { MessageBox } from 'element-ui'
import { selectNodeServerList, selectNodeServerById } from '@/api/node-server'
import {
  createKernelTask,
  kernelInventory,
  kernelReleases,
  probeKernelMTLS,
  retryKernelTask,
  selectKernelTaskById,
  selectKernelTaskPage
} from '@/api/kernel-upgrade'

const terminal = ['succeeded', 'partial', 'failed']

export default {
  name: 'KernelUpgrade',
  data() {
    return {
      servers: [],
      selectedNodeIds: [],
      canaryNodeId: undefined,
      currentServer: {},
      inventory: null,
      inventoryLoading: false,
      task: null,
      taskHistory: [],
      timer: null,
      releases: {
        xray: { stable: [], prerelease: [] },
        hysteria2: { stable: [], prerelease: [] }
      },
      rows: [
        { key: 'xray', name: 'Xray', targetChannel: 'stable', targetVersion: '', selected: false },
        { key: 'hysteria2', name: 'Hysteria2', targetChannel: 'stable', targetVersion: '', selected: false }
      ]
    }
  },
  computed: {
    serverId() {
      return Number(this.$route.query.serverId || 0)
    },
    batchMode() {
      return this.serverId === 0
    },
    selectedServers() {
      return this.servers.filter((server) => this.selectedNodeIds.includes(server.id))
    },
    kernelRows() {
      return this.rows.map((row) => {
        const inventoryItem = this.inventory
          ? (this.inventory.kernels || []).find((item) => item.kernel === (row.key === 'xray' ? 1 : 2))
          : null
        const versions = inventoryItem ? inventoryItem.versions || [] : []
        return Object.assign(row, {
          supported: this.batchMode || (inventoryItem && inventoryItem.supported),
          currentVersion: inventoryItem ? inventoryItem.currentVersion : '',
          currentSha256: inventoryItem ? inventoryItem.currentSha256 : '',
          inUse: inventoryItem ? inventoryItem.inUse : false,
          rollbackVersions: versions
            .filter((version) => version.successful && version.version !== inventoryItem.currentVersion)
            .slice(0, 2)
            .map((version) => Object.assign(version, { channelName: this.channelName(version.channel) }))
        })
      })
    },
    canSubmitBatch() {
      return this.selectedNodeIds.length > 0 && this.rows.some((row) => row.selected && row.targetVersion)
    }
  },
  created() {
    selectNodeServerList().then((response) => {
      this.servers = response.data
      if (this.serverId) {
        this.selectedNodeIds = [this.serverId]
      }
    })
    if (this.serverId) {
      selectNodeServerById({ id: this.serverId }).then((response) => {
        this.currentServer = response.data
      })
      this.loadInventory()
    }
    this.loadReleases(false)
    this.loadTaskHistory()
    if (this.$route.query.taskId) {
      this.loadTask(Number(this.$route.query.taskId))
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
  methods: {
    stageLabel(stage) {
      return this.$t(`kernel.stages.${stage}`)
    },
    statusLabel(status) {
      return this.$t(`kernel.statuses.${status}`)
    },
    loadTaskHistory() {
      return selectKernelTaskPage({ pageNum: 1, pageSize: 20 }).then((response) => {
        this.taskHistory = response.data.tasks || []
      })
    },
    openTask(id) {
      this.$router.replace({
        path: this.$route.path,
        query: Object.assign({}, this.$route.query, { taskId: id })
      })
      this.loadTask(id)
    },
    channelName(channel) {
      return channel === 2 ? 'prerelease' : channel === 3 ? 'legacy' : 'stable'
    },
    loadInventory() {
      this.inventoryLoading = true
      return kernelInventory({ nodeServerId: this.serverId })
        .then((response) => {
          this.inventory = response.data
        })
        .finally(() => {
          this.inventoryLoading = false
        })
    },
    loadReleases(refresh) {
      const calls = []
      ;['xray', 'hysteria2'].forEach((kernel) => {
        ['stable', 'prerelease'].forEach((channel) => {
          calls.push(
            kernelReleases({ kernel, channel, refresh }).then((response) => {
              this.releases[kernel][channel] = response.data.releases || []
            })
          )
        })
      })
      return Promise.all(calls)
    },
    toggleTarget(row) {
      row.selected = !row.selected
    },
    confirmPrerelease(targets) {
      if (!targets.some((target) => target.channel === 'prerelease')) return Promise.resolve()
      return MessageBox.confirm(this.$t('kernel.prereleaseWarning'), this.$t('confirm.warn'), {
        type: 'warning'
      }).then(() =>
        MessageBox.confirm(this.$t('kernel.prereleaseSecondWarning'), this.$t('confirm.warn'), {
          type: 'error'
        })
      )
    },
    submitSingle(row, version, channel, action) {
      const targets = [{ kernel: row.key, version, channel, action }]
      this.confirmPrerelease(targets).then(() => this.submit([this.serverId], 0, targets))
    },
    submitBatch() {
      const targets = this.rows
        .filter((row) => row.selected)
        .map((row) => ({
          kernel: row.key,
          version: row.targetVersion,
          channel: row.targetChannel,
          action: 'install'
        }))
      this.confirmPrerelease(targets).then(() =>
        this.submit(this.selectedNodeIds, this.canaryNodeId || 0, targets)
      )
    },
    submit(nodeServerIds, canaryNodeServerId, targets) {
      return createKernelTask({ nodeServerIds, canaryNodeServerId, targets }).then((response) => {
        this.task = response.data
        this.$router.replace({
          path: this.$route.path,
          query: Object.assign({}, this.$route.query, { taskId: this.task.id })
        })
        this.loadTask(this.task.id)
      })
    },
    loadTask(id) {
      clearTimeout(this.timer)
      selectKernelTaskById({ id }).then((response) => {
        this.task = response.data
        if (!terminal.includes(this.task.status)) {
          this.timer = setTimeout(() => this.loadTask(id), 2000)
        } else if (!this.batchMode) {
          this.loadInventory()
        }
        if (terminal.includes(this.task.status)) {
          this.loadTaskHistory()
        }
      })
    },
    retryTask() {
      retryKernelTask({ id: this.task.id }).then(() => this.loadTask(this.task.id))
    },
    enableMTLS() {
      MessageBox.prompt(this.$t('kernel.tlsServerNameRequired'), this.$t('kernel.probeMTLS'), {
        inputValue: this.currentServer.grpcTlsServerName || '',
        inputPattern: /^[A-Za-z0-9.-]{4,253}$/,
        inputErrorMessage: this.$t('kernel.tlsServerNameRequired')
      }).then(({ value }) =>
        MessageBox.confirm(this.$t('kernel.mtlsNoFallback'), this.$t('confirm.warn'), {
          type: 'warning'
        }).then(() => probeKernelMTLS({ nodeServerId: this.serverId, serverName: value }).then(() => {
          this.currentServer.grpcTlsMode = 'mtls'
          this.currentServer.grpcTlsServerName = value
          this.$message.success(this.$t('kernel.mtlsEnabled'))
        }))
      )
    }
  }
}
</script>

<style scoped>
.section {
  margin-bottom: 20px;
}
.hash {
  font-family: monospace;
  word-break: break-all;
}
.submit {
  margin-top: 20px;
}
</style>

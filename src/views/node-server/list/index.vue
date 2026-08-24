<template>
  <div class="prototype-page grid">
    <div class="glass card">
      <div class="toolbar">
        <div class="search-box">
          <i class="liquid-icon--search"></i
          ><input
            v-model="listQuery.name"
            placeholder="按名称搜索"
            @keyup.enter="handleFilter"
          />
        </div>
        <div class="search-box">
          <i class="liquid-icon--connection"></i
          ><input
            v-model="listQuery.ip"
            placeholder="按 IP 搜索"
            @keyup.enter="handleFilter"
          />
        </div>
        <div class="spacer"></div>
        <button
          v-if="checkPermission(['sysadmin'])"
          class="cap small"
          type="button"
          @click="downloadTemplate"
        >
          <i class="liquid-icon--document"></i>模板
        </button>
        <button
          v-if="checkPermission(['sysadmin'])"
          class="cap small"
          type="button"
          @click="handleImport"
        >
          <i class="liquid-icon--import"></i>导入
        </button>
        <button
          v-if="checkPermission(['sysadmin'])"
          class="cap small"
          type="button"
          @click="handleExport"
        >
          <i class="liquid-icon--export"></i>导出
        </button>
        <button
          v-if="checkPermission(['sysadmin'])"
          class="cap small"
          type="button"
          @click="handleBatchUpgrade"
        >
          <i class="liquid-icon--upgrade"></i>批量升级
        </button>
        <button
          v-if="checkPermission(['sysadmin'])"
          class="cap primary small"
          type="button"
          @click="handleCreate"
        >
          <i class="liquid-icon--plus"></i>添加服务器
        </button>
      </div>
    </div>

    <div class="glass card">
      <div class="tbl-wrap" v-liquid-loading="listLoading">
        <table class="tbl">
          <thead>
            <tr>
              <th>服务器</th>
              <th>gRPC</th>
              <th>流量配额</th>
              <th>内核</th>
              <th>Core</th>
              <th>状态</th>
              <th class="traffic-reset-column">
                <div class="traffic-reset-column-head">
                  <span>流量统计</span>
                  <button
                    v-if="checkPermission(['sysadmin', 'admin'])"
                    class="cap small traffic-reset-button"
                    type="button"
                    title="重置所有服务器流量统计"
                    aria-label="重置所有服务器流量统计"
                    @click="handleResetAllServerTraffic"
                  >
                    <i class="liquid-icon--refresh"></i>重置全部
                  </button>
                </div>
              </th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in list" :key="row.id">
              <td class="primary-cell">
                <strong>{{ row.name }}</strong
                ><small class="mono">{{ row.ip }}</small>
              </td>
              <td>
                <span class="mono muted">:{{ row.grpcPort }}</span
                ><span
                  class="chip"
                  :class="row.grpcTlsMode === 'mtls' ? 'ok' : 'warn'"
                  >{{ row.grpcTlsMode || 'legacy' }}</span
                >
              </td>
              <td style="min-width: 190px">
                <span
                  v-if="
                    !row.trafficStatus || row.trafficStatus.period === 'none'
                  "
                  class="chip plain"
                  >不限额</span
                >
                <span v-else-if="row.trafficStatus.reached" class="chip bad"
                  >已达限额</span
                >
                <template v-else>
                  <div class="traffic-label">
                    <span class="faint">{{ row.trafficStatus.period }}</span
                    ><span class="muted num">{{
                      row.trafficStatus.limitMode === 'separate'
                        ? '↑ ' +
                          quotaFlow(
                            row.trafficStatus.uploadLimit,
                            row.trafficStatus.uploadRemaining
                          ) +
                          ' / ↓ ' +
                          quotaFlow(
                            row.trafficStatus.downloadLimit,
                            row.trafficStatus.downloadRemaining
                          )
                        : getFlow(row.trafficStatus.totalRemaining)
                    }}</span>
                  </div>
                  <div class="meter"><i style="width: 45%"></i></div>
                </template>
              </td>
              <td>
                <span class="chip plain mono">{{
                  row.kernelSummary || '未上报'
                }}</span>
              </td>
              <td class="mono muted">
                {{ row.trojanPanelCoreVersion || '—' }}
              </td>
              <td>
                <span class="chip" :class="row.status === 1 ? 'ok' : 'bad'"
                  ><span class="dot"></span
                  >{{ statusComputed(row.status) }}</span
                >
              </td>
              <td>
                <button
                  v-if="checkPermission(['sysadmin', 'admin'])"
                  class="cap small traffic-reset-button"
                  type="button"
                  :disabled="resettingServerId !== 0"
                  :title="`重置服务器 ${row.name} 的流量统计`"
                  :aria-label="`重置服务器 ${row.name} 的流量统计`"
                  @click="handleResetServerTraffic(row)"
                >
                  <i class="liquid-icon--refresh-left"></i>重置流量
                </button>
                <span v-else class="faint">—</span>
              </td>
              <td>
                <div class="row-actions">
                  <button
                    class="icon-btn"
                    type="button"
                    title="运行状态"
                    @click="handleDetail(row)"
                  >
                    <i class="liquid-icon--view"></i>
                  </button>
                  <button
                    v-if="checkPermission(['sysadmin'])"
                    class="icon-btn"
                    type="button"
                    title="内核管理"
                    @click="handleKernelManage(row)"
                  >
                    <i class="liquid-icon--top"></i>
                  </button>
                  <button
                    v-if="checkPermission(['sysadmin'])"
                    class="icon-btn"
                    type="button"
                    title="编辑"
                    @click="handleUpdate(row)"
                  >
                    <i class="liquid-icon--edit"></i>
                  </button>
                  <button
                    v-if="checkPermission(['sysadmin'])"
                    class="icon-btn danger"
                    type="button"
                    title="删除"
                    @click="handleDelete(row, index)"
                  >
                    <i class="liquid-icon--delete"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <pagination
        v-if="total > 0"
        :total="total"
        :page.sync="listQuery.pageNum"
        :limit.sync="listQuery.pageSize"
        @pagination="getList"
      />
    </div>

    <div v-if="detailServer" class="glass sheet">
      <div class="card-head">
        <div>
          <span class="kicker">Server State</span>
          <h2>{{ detailServer.name }} · 运行状态</h2>
        </div>
        <button class="icon-btn" type="button" @click="detailServer = null">
          <i class="liquid-icon--close"></i>
        </button>
      </div>
      <div class="server-detail-layout">
        <div class="rings-row">
          <div
            v-for="ring in [
              {
                label: 'CPU',
                value: detailState.cpuUsed || 0,
                color: 'var(--chart-1)'
              },
              {
                label: '内存',
                value: detailState.memUsed || 0,
                color: 'var(--chart-2)'
              },
              {
                label: '磁盘',
                value: detailState.diskUsed || 0,
                color: 'var(--chart-3)'
              }
            ]"
            :key="ring.label"
          >
            <div
              class="ring"
              :style="{ '--p': ring.value, '--ring-color': ring.color }"
            >
              <b>{{ ring.value }}<em>%</em></b>
            </div>
            <div class="ring-label">{{ ring.label }}</div>
          </div>
        </div>
        <div class="kv-grid">
          <div class="kv">
            <span>传输安全</span
            ><b>{{ detailServer.grpcTlsMode || 'legacy' }}</b>
          </div>
          <div class="kv">
            <span>Core 版本</span
            ><b>{{ detailServer.trojanPanelCoreVersion || '—' }}</b>
          </div>
          <div class="kv">
            <span>创建时间</span
            ><b>{{ timeStampToDate(detailServer.createTime, false) }}</b>
          </div>
          <div class="kv">
            <span>运行状态</span
            ><b>{{ statusComputed(detailServer.status) }}</b>
          </div>
        </div>
      </div>
    </div>

    <NodeServerForm
      ref="nodeServerForm"
      :node-server="temp"
      :dialog-status="dialogStatus"
      :dialog-visible.sync="dialogFormVisible"
      :get-list="getList"
    />
    <import-tip
      ref="importTip"
      :dialog-form-visible.sync="importVisible"
      :label="$t('table.coverByNodeServerName')"
      :import-data="importData"
      :download-template="downloadTemplate"
    />
  </div>
</template>

<script>
import { timeStampToDate } from '@/utils'
import Pagination from '@/components/Pagination'
import ImportTip from '@/components/ImportTip'
import { MessageBox } from '@/utils/liquid-feedback'
import checkPermission from '@/utils/permission'
import {
  deleteNodeServerById,
  exportNodeServer,
  importNodeServer,
  selectNodeServerPage,
  nodeServerState,
  resetNodeServerTraffic
} from '@/api/node-server'
import NodeServerForm from '@/views/node-server/list/compoments/NodeServerForm'
import { downloadTemplate } from '@/api/file-task'
import { getFlow } from '@/utils/account'

export default {
  name: 'NodeServer',
  components: { NodeServerForm, Pagination, ImportTip },
  data() {
    return {
      tableKey: 0,
      listLoading: true,
      list: null,
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        ip: undefined,
        name: undefined
      },
      temp: {
        id: undefined,
        ip: '',
        name: '',
        grpcPort: 8100,
        grpcTlsMode: 'mtls',
        grpcTlsServerName: '',
        trafficPeriod: 'none',
        trafficLimitMode: 'combined',
        trafficTotalLimit: 0,
        trafficUploadLimit: 0,
        trafficDownloadLimit: 0,
        trojanPanelCoreVersion: '',
        createTime: new Date()
      },
      dialogFormVisible: false,
      textMap: {
        update: this.$t('table.edit'),
        create: this.$t('table.add')
      },
      importVisible: false,
      dialogStatus: '',
      resettingServerId: 0,
      detailServer: null,
      detailState: { cpuUsed: 0, memUsed: 0, diskUsed: 0 }
    }
  },
  created() {
    this.getList()
  },
  filters: {
    statusTypeFilter(status) {
      return status > 0 ? 'success' : 'danger'
    },
    disabledFilter(status) {
      return status !== 1
    }
  },
  computed: {
    statusComputed() {
      return function (status) {
        return status === 1
          ? this.$t('table.nodeStatusSuccess')
          : this.$t('table.nodeStatusError')
      }
    }
  },
  methods: {
    getFlow,
    quotaFlow(limit, remaining) {
      return limit > 0 ? getFlow(remaining) : this.$t('traffic.unlimited')
    },
    checkPermission,
    timeStampToDate,
    getList() {
      this.listLoading = true
      selectNodeServerPage(this.listQuery).then((response) => {
        this.list = response.data.nodeServers
        this.total = response.data.total

        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        ip: '',
        name: '',
        grpcPort: 8100,
        grpcTlsMode: 'mtls',
        grpcTlsServerName: '',
        trafficPeriod: 'none',
        trafficLimitMode: 'combined',
        trafficTotalLimit: 0,
        trafficUploadLimit: 0,
        trafficDownloadLimit: 0,
        trojanPanelCoreVersion: '',
        createTime: new Date()
      }
    },
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$refs.nodeServerForm.clearValidate()
    },
    handleDelete(row, index) {
      MessageBox.confirm(
        this.$t('confirm.deleteNodeServer'),
        this.$t('confirm.warn'),
        {
          confirmButtonText: this.$t('confirm.yes'),
          cancelButtonText: this.$t('confirm.cancel'),
          type: 'warning'
        }
      ).then(() => {
        const tempData = Object.assign({}, row)
        deleteNodeServerById(tempData).then(() => {
          this.list.splice(index, 1)
          this.$notify({
            title: 'Success',
            message: this.$t('confirm.deleteSuccess'),
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    handleResetAllServerTraffic() {
      this.showPendingTrafficReset('全部服务器')
    },
    handleResetServerTraffic(row) {
      if (this.resettingServerId) return
      MessageBox.confirm(
        this.$t('traffic.resetServerConfirm', { name: row.name }),
        this.$t('confirm.warn'),
        {
          confirmButtonText: this.$t('confirm.yes'),
          cancelButtonText: this.$t('confirm.cancel'),
          type: 'warning'
        }
      )
        .then(() => {
          this.resettingServerId = row.id
          return resetNodeServerTraffic({ id: row.id })
        })
        .then(() => {
          this.$notify({
            title: 'Success',
            message: this.$t('traffic.resetServerSuccess'),
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
        .finally(() => {
          this.resettingServerId = 0
        })
    },
    showPendingTrafficReset(target) {
      this.$message({
        type: 'info',
        showClose: true,
        message: `${target}流量统计重置接口待接入，当前未修改任何数据`
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign(this.temp, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$refs.nodeServerForm.clearValidate()
    },
    handleDetail(row) {
      if (this.detailServer && this.detailServer.id === row.id) {
        this.detailServer = null
        return
      }
      nodeServerState({ id: row.id }).then(({ data }) => {
        this.detailServer = row
        this.detailState = data
      })
    },
    handleKernelManage(row) {
      this.$router.push({
        path: 'kernel-upgrade',
        query: { serverId: row.id }
      })
    },
    handleBatchUpgrade() {
      this.$router.push({ path: 'kernel-upgrade' })
    },
    importData(params) {
      this.$refs['importTip'].$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.$refs['importTip'].temp)
          let formData = new FormData()
          formData.append('file', params.file)
          formData.append('cover', tempData.cover)
          importNodeServer(formData).then(() => {
            this.importVisible = false
            this.$notify({
              title: 'Success',
              message: this.$t('confirm.taskSubmitSuccess'),
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleImport() {
      this.importVisible = true
    },
    handleExport() {
      exportNodeServer().then(() => {
        this.importVisible = false
        this.$notify({
          title: 'Success',
          message: this.$t('confirm.taskSubmitSuccess'),
          type: 'success',
          duration: 2000
        })
      })
    },
    downloadTemplate() {
      downloadTemplate({ id: 2 }).then((res) => {
        // 将二进制文件转化为可访问的url
        const blob = new Blob([res.data], {
          type: 'application/octet-stream'
        })
        let url = window.URL.createObjectURL(blob)
        let a = document.createElement('a')
        document.body.appendChild(a)
        a.href = url
        let dis = res.headers['content-disposition']
        a.download = dis.split('attachment; filename=')[1]
        // 模拟点击下载
        a.click()
        window.URL.revokeObjectURL(url)
        this.$notify({
          title: 'Success',
          message: this.$t('confirm.taskDownloadSuccess'),
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>

<style scoped>
.liquid-button {
  margin-left: 10px;
}
</style>

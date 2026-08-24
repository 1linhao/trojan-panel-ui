<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.ip"
        :placeholder="$t('table.nodeServerIp')"
        style="width: 200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        maxlength="64"
      />
      <el-input
        v-model="listQuery.name"
        :placeholder="$t('table.nodeServerName')"
        style="width: 200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        maxlength="20"
      />
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        {{ $t('table.search') }}
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
        v-if="checkPermission(['sysadmin'])"
      >
        {{ $t('table.add') }}
      </el-button>
      <el-button
        class="filter-item"
        type="success"
        icon="el-icon-upload2"
        @click="handleImport"
        v-if="checkPermission(['sysadmin'])"
      >
        {{ $t('table.import') }}
      </el-button>
      <el-button
        class="filter-item"
        type="success"
        icon="el-icon-download"
        @click="handleExport"
        v-if="checkPermission(['sysadmin'])"
      >
        {{ $t('table.export') }}
      </el-button>
      <el-button
        v-if="checkPermission(['sysadmin'])"
        class="filter-item"
        type="warning"
        icon="el-icon-upload"
        @click="handleBatchUpgrade"
      >
        {{ $t('kernel.batchUpgrade') }}
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column
        :label="$t('table.id')"
        sortable="custom"
        align="center"
        width="80"
        type="index"
      />
      <el-table-column
        :label="$t('table.nodeServerName')"
        width="180"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.nodeServerIp')"
        width="180"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.nodeServerGrpcPort')"
        width="180"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.grpcPort }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.nodeStatus')"
        width="100"
        align="center"
        v-if="checkPermission(['sysadmin', 'admin'])"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusTypeFilter">
            <span>{{ statusComputed(row.status) }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.trojanPanelCoreVersion')"
        width="180"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.trojanPanelCoreVersion }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('traffic.remaining')" min-width="220" align="center">
        <template slot-scope="{ row }">
          <span v-if="!row.trafficStatus || row.trafficStatus.period === 'none'">{{ $t('traffic.unlimited') }}</span>
          <el-tag v-else-if="row.trafficStatus.reached" type="danger">{{ $t('traffic.reached') }}</el-tag>
          <span v-else-if="row.trafficStatus.limitMode === 'separate'">
            {{ $t('table.upload') }} {{ quotaFlow(row.trafficStatus.uploadLimit, row.trafficStatus.uploadRemaining) }} /
            {{ $t('table.download') }} {{ quotaFlow(row.trafficStatus.downloadLimit, row.trafficStatus.downloadRemaining) }}
          </span>
          <span v-else>{{ getFlow(row.trafficStatus.totalRemaining) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="checkPermission(['sysadmin'])"
        :label="$t('kernel.kernelSummary')"
        min-width="220"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.kernelSummary || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="checkPermission(['sysadmin'])"
        :label="$t('kernel.transport')"
        width="110"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.grpcTlsMode === 'mtls' ? 'success' : 'warning'">
            {{ row.grpcTlsMode || 'legacy' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.createTime')"
        width="150"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ timeStampToDate(row.createTime, false) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.actions')"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(row)"
            v-if="checkPermission(['sysadmin'])"
          >
            {{ $t('table.edit') }}
          </el-button>
          <el-button
            type="success"
            size="mini"
            :disabled="row.status | disabledFilter"
            @click="handleDetail(row)"
          >
            {{ $t('table.detail') }}
          </el-button>
          <el-button
            v-if="checkPermission(['sysadmin'])"
            size="mini"
            type="warning"
            @click="handleKernelManage(row)"
          >
            {{ $t('kernel.manage') }}
          </el-button>
          <el-button
            v-if="checkPermission(['sysadmin', 'admin'])"
            size="mini"
            type="warning"
            :disabled="resettingServerId !== 0"
            @click="handleResetServerTraffic(row)"
          >
            {{ $t('traffic.resetServer') }}
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
            v-if="checkPermission(['sysadmin'])"
          >
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-if="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />

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
import { MessageBox } from 'element-ui'
import checkPermission from '@/utils/permission'
import {
  deleteNodeServerById,
  exportNodeServer,
  importNodeServer,
  selectNodeServerPage,
  resetNodeServerTraffic
} from '@/api/node-server'
import Cookies from 'js-cookie'
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
      resettingServerId: 0
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
    handleUpdate(row) {
      this.temp = Object.assign(this.temp, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$refs.nodeServerForm.clearValidate()
    },
    handleDetail(row) {
      Cookies.set('nodeServerId', row.id)
      this.$router.push({ path: 'server-detail' })
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
.el-button {
  margin-left: 10px;
}
</style>

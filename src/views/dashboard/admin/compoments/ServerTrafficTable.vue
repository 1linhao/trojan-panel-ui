<template>
  <div>
    <div class="filters">
      <el-select v-model="query.nodeServerId" clearable :placeholder="$t('traffic.allServers')" @change="fetchData">
        <el-option v-for="server in servers" :key="server.id" :label="server.name" :value="server.id" />
      </el-select>
      <el-radio-group v-model="query.period" size="small" @change="fetchData">
        <el-radio-button label="total">{{ $t('traffic.total') }}</el-radio-button>
        <el-radio-button label="year">{{ $t('traffic.year') }}</el-radio-button>
        <el-radio-button label="month">{{ $t('traffic.month') }}</el-radio-button>
        <el-radio-button label="day">{{ $t('traffic.day') }}</el-radio-button>
      </el-radio-group>
      <el-switch v-model="split" :active-text="$t('traffic.split')" :inactive-text="$t('traffic.combined')" />
    </div>
    <el-table :data="rows" v-loading="loading" style="width:100%">
      <el-table-column prop="username" :label="$t('dashboard.username')" min-width="150" />
      <el-table-column prop="nodeServerName" :label="$t('table.nodeServerName')" min-width="150" />
      <el-table-column v-if="split" :label="$t('table.upload')" min-width="130"><template slot-scope="s">{{ getFlow(s.row.upload) }}</template></el-table-column>
      <el-table-column v-if="split" :label="$t('table.download')" min-width="130"><template slot-scope="s">{{ getFlow(s.row.download) }}</template></el-table-column>
      <el-table-column :label="$t('traffic.combined')" min-width="130"><template slot-scope="s">{{ getFlow(s.row.total) }}</template></el-table-column>
    </el-table>
    <pagination v-if="total>0" :total="total" :page.sync="query.pageNum" :limit.sync="query.pageSize" @pagination="fetchData" />
  </div>
</template>

<script>
import { serverTrafficUsage } from '@/api/dashboard'
import { selectNodeServerList } from '@/api/node-server'
import { getFlow } from '@/utils/account'
import Pagination from '@/components/Pagination'
export default {
  name: 'ServerTrafficTable', components: { Pagination },
  data() { return { rows: [], servers: [], total: 0, loading: false, split: true, query: { period: 'day', nodeServerId: undefined, pageNum: 1, pageSize: 20 } } },
  created() { selectNodeServerList({}).then(r => { this.servers = r.data }); this.fetchData() },
  methods: { getFlow, fetchData() { this.loading = true; serverTrafficUsage(this.query).then(r => { this.rows = r.data.rows; this.total = r.data.total }).finally(() => { this.loading = false }) } }
}
</script>
<style scoped>.filters > * { margin: 0 12px 12px 0; }</style>

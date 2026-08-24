<template>
  <div class="dashboard-table-block">
    <div class="dashboard-filters">
      <liquid-select
        v-model="query.nodeServerId"
        clearable
        class="dashboard-server-select"
        :placeholder="$t('traffic.allServers')"
        @change="fetchData"
      >
        <option
          v-for="server in servers"
          :key="server.id"
          :label="server.name"
          :value="server.id"
        />
      </liquid-select>
      <div class="seg dashboard-segment" role="group">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          type="button"
          :class="{ on: query.period === option.value }"
          @click="setPeriod(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <liquid-table :data="rows" v-liquid-loading="loading" style="width: 100%">
      <liquid-table-column
        prop="username"
        :label="$t('dashboard.username')"
        min-width="150"
      />
      <liquid-table-column
        prop="nodeServerName"
        :label="$t('table.nodeServerName')"
        min-width="150"
      />
      <liquid-table-column :label="$t('table.upload')" min-width="130"
        ><template slot-scope="s">{{
          getFlow(s.row.upload)
        }}</template></liquid-table-column
      >
      <liquid-table-column
        :label="$t('table.download')"
        min-width="130"
        ><template slot-scope="s">{{
          getFlow(s.row.download)
        }}</template></liquid-table-column
      >
      <liquid-table-column :label="$t('traffic.combined')" min-width="130"
        ><template slot-scope="s">{{
          getFlow(s.row.total)
        }}</template></liquid-table-column
      >
    </liquid-table>
    <pagination
      v-if="total > query.pageSize"
      :total="total"
      :page.sync="query.pageNum"
      :limit.sync="query.pageSize"
      @pagination="fetchData"
    />
  </div>
</template>

<script>
import { serverTrafficUsage } from '@/api/dashboard'
import { selectNodeServerList } from '@/api/node-server'
import { getFlow } from '@/utils/account'
import Pagination from '@/components/Pagination'
export default {
  name: 'ServerTrafficTable',
  components: { Pagination },
  data() {
    return {
      rows: [],
      servers: [],
      total: 0,
      loading: false,
      query: {
        period: 'day',
        nodeServerId: undefined,
        pageNum: 1,
        pageSize: 20
      }
    }
  },
  computed: {
    periodOptions() {
      return [
        { value: 'total', label: this.$t('traffic.total') },
        { value: 'year', label: this.$t('traffic.year') },
        { value: 'month', label: this.$t('traffic.month') },
        { value: 'day', label: this.$t('traffic.day') }
      ]
    }
  },
  created() {
    selectNodeServerList({}).then((response) => {
      this.servers = response.data
    })
    this.fetchData()
  },
  methods: {
    getFlow,
    setPeriod(period) {
      if (period === this.query.period) return
      this.query.period = period
      this.fetchData()
    },
    fetchData() {
      this.loading = true
      serverTrafficUsage(this.query)
        .then((response) => {
          this.rows = response.data.rows
          this.total = response.data.total
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

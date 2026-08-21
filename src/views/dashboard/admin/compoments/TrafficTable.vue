<template>
  <div>
    <el-radio-group v-model="period" size="small" @change="fetchData">
      <el-radio-button label="total">{{ $t('traffic.total') }}</el-radio-button>
      <el-radio-button label="month">{{ $t('traffic.month') }}</el-radio-button>
      <el-radio-button label="day">{{ $t('traffic.day') }}</el-radio-button>
    </el-radio-group>
    <el-table :data="list" style="width: 100%" v-loading="loading">
    <el-table-column
      :label="$t('dashboard.ranking')"
      width="100"
      align="center"
      type="index"
    />
    <el-table-column
      :label="$t('dashboard.username')"
      width="200"
      align="center"
    >
      <template slot-scope="scope">
        {{ scope.row.username }}
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('dashboard.trafficUsed')"
      min-width="200"
      align="center"
    >
      <template slot-scope="scope">
        {{ getFlow(scope.row.trafficUsed) }}</template
      >
    </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { trafficRank } from '@/api/dashboard'
import { getFlow } from '@/utils/account'

export default {
  name: 'trafficTable',
  data() {
    return {
      list: null,
      period: 'total',
      loading: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    getFlow,
    fetchData() {
      this.loading = true
      trafficRank({ period: this.period })
        .then((response) => {
          this.list = response.data
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

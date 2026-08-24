<template>
  <div>
    <el-radio-group v-model="period" size="small" @change="fetchData">
      <el-radio-button label="total">{{ $t('traffic.rankAll') }}</el-radio-button>
      <el-radio-button label="month">{{ $t('traffic.rankMonth') }}</el-radio-button>
      <el-radio-button label="day">{{ $t('traffic.rankDay') }}</el-radio-button>
    </el-radio-group>
    <el-date-picker
      v-if="period === 'month'"
      v-model="selectedMonth"
      type="month"
      value-format="yyyy-MM"
      :clearable="false"
      :placeholder="$t('traffic.selectMonth')"
      @change="fetchData"
    />
    <el-date-picker
      v-if="period === 'day'"
      v-model="selectedDay"
      type="date"
      value-format="yyyy-MM-dd"
      :clearable="false"
      :placeholder="$t('traffic.selectDay')"
      @change="fetchData"
    />
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
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return {
      list: null,
      period: 'total',
      selectedMonth: `${year}-${month}`,
      selectedDay: `${year}-${month}-${day}`,
      requestSerial: 0,
      loading: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    getFlow,
    fetchData() {
      const requestSerial = ++this.requestSerial
      this.loading = true
      const query = { period: this.period }
      if (this.period === 'month') query.date = this.selectedMonth
      if (this.period === 'day') query.date = this.selectedDay
      trafficRank(query)
        .then((response) => {
          if (requestSerial === this.requestSerial) {
            this.list = response.data
          }
        })
        .finally(() => {
          if (requestSerial === this.requestSerial) {
            this.loading = false
          }
        })
    }
  }
}
</script>

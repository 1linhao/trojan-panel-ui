<template>
  <div class="dashboard-table-block">
    <div class="seg dashboard-segment dashboard-segment-3" role="group" aria-label="排行周期">
      <button
        v-for="option in periodOptions"
        :key="option.value"
        type="button"
        :class="{ on: period === option.value }"
        :aria-pressed="String(period === option.value)"
        @click="setPeriod(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
    <liquid-date-picker
      v-if="period === 'month'"
      :value="selectedMonth"
      class="traffic-rank-date"
      type="month"
      value-format="yyyy-MM"
      :clearable="false"
      :placeholder="$t('traffic.selectMonth')"
      @input="setSelectedDate('month', $event)"
    />
    <liquid-date-picker
      v-if="period === 'day'"
      :value="selectedDay"
      class="traffic-rank-date"
      type="date"
      value-format="yyyy-MM-dd"
      :clearable="false"
      :placeholder="$t('traffic.selectDay')"
      @input="setSelectedDate('day', $event)"
    />
    <liquid-table :data="list" class="full-width-table" v-liquid-loading="loading">
      <liquid-table-column
        :label="$t('dashboard.ranking')"
        width="100"
        align="center"
        type="index"
      />
      <liquid-table-column
        prop="username"
        :label="$t('dashboard.username')"
        width="200"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </liquid-table-column>
      <liquid-table-column
        prop="trafficUsed"
        :label="$t('dashboard.trafficUsed')"
        min-width="200"
        align="center"
      >
        <template slot-scope="scope">
          {{ getFlow(scope.row.trafficUsed) }}</template
        >
      </liquid-table-column>
    </liquid-table>
  </div>
</template>

<script>
import { trafficRank } from '@/api/dashboard'
import { getFlow } from '@/utils/account'

export default {
  name: 'TrafficTable',
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
  computed: {
    periodOptions() {
      return [
        { value: 'total', label: this.$t('traffic.rankAll') },
        { value: 'month', label: this.$t('traffic.rankMonth') },
        { value: 'day', label: this.$t('traffic.rankDay') }
      ]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    getFlow,
    setPeriod(period) {
      if (period === this.period) return
      this.period = period
      this.fetchData()
    },
    setSelectedDate(period, value) {
      const property = period === 'month' ? 'selectedMonth' : 'selectedDay'
      if (this[property] === value) return
      this[property] = value
      if (this.period === period) this.fetchData()
    },
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

<style scoped>
.traffic-rank-date {
  margin-bottom: 12px;
}
</style>

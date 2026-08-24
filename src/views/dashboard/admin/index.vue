<template>
  <div class="prototype-page grid">
    <div class="grid cols-4">
      <div class="glass stat-tile">
        <span class="icon-wrap tone-blue"><i class="el-icon-user-solid" /></span>
        <b class="num">{{ panelGroupData.accountCount }}</b
        ><span>账号总数</span>
      </div>
      <div class="glass stat-tile">
        <span class="icon-wrap tone-violet"><i class="el-icon-connection" /></span>
        <b class="num">{{
          panelGroupData.nodeCount || panelGroupData.nodeNum
        }}</b
        ><span>节点数量</span>
      </div>
      <div class="glass card span-2">
        <span class="kicker">面板服务器资源</span>
        <div class="rings-row">
          <div v-for="ring in rings" :key="ring.label">
            <div
              class="ring"
              :style="{ '--p': ring.value, '--ring-color': ring.color }"
            >
              <b>{{ ring.value }}<em>%</em></b>
            </div>
            <div class="ring-label">{{ ring.label }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid cols-2 dashboard-detail-grid">
      <div class="glass card">
        <div class="card-head">
          <div>
            <span class="kicker">Traffic Rank</span>
            <h2>账号流量排行</h2>
          </div>
        </div>
        <traffic-table />
      </div>
      <div class="glass card">
        <div class="card-head">
          <div>
            <span class="kicker">Per-Server Usage</span>
            <h2>服务器流量明细</h2>
          </div>
        </div>
        <server-traffic-table />
      </div>
    </div>
  </div>
</template>

<script>
import TrafficTable from '@/views/dashboard/admin/compoments/TrafficTable'
import ServerTrafficTable from '@/views/dashboard/admin/compoments/ServerTrafficTable'
import { panelGroup } from '@/api/dashboard'

export default {
  name: 'AdminDashboard',
  components: { TrafficTable, ServerTrafficTable },
  data() {
    return {
      panelGroupData: {
        accountCount: 0,
        nodeCount: 0,
        nodeNum: 0,
        cpuUsed: 0,
        memUsed: 0,
        diskUsed: 0
      }
    }
  },
  computed: {
    rings() {
      return [
        {
          label: 'CPU',
          value: this.percent(this.panelGroupData.cpuUsed),
          color: 'var(--chart-1)'
        },
        {
          label: '内存',
          value: this.percent(this.panelGroupData.memUsed),
          color: 'var(--chart-2)'
        },
        {
          label: '磁盘',
          value: this.percent(this.panelGroupData.diskUsed),
          color: 'var(--chart-3)'
        }
      ]
    }
  },
  created() {
    panelGroup().then(({ data }) => {
      this.panelGroupData = data
    })
  },
  methods: {
    percent(value) {
      return Math.max(0, Math.min(100, Math.round(Number(value) || 0)))
    }
  }
}
</script>

<template>
  <div class="prototype-page">
    <div class="grid cols-3">
      <ui-panel
        v-for="metric in metrics"
        :key="metric.key"
        variant="metric"
        class="stat-tile"
        :motion-key="`server-${metric.key}-usage`"
      >
        <span :class="['icon-wrap', metric.tone]">
          <app-icon name="cpu" />
        </span>
        <b class="num">{{ metric.value }}<em>%</em></b>
        <span>{{ metric.label }}</span>
      </ui-panel>
    </div>
  </div>
</template>

<script>
import { nodeServerState } from '@/api/node-server'
import Cookies from 'js-cookie'

export default {
  name: 'NodeServerDetailPage',
  data() {
    return {
      nodeServerGroupData: {
        cpuUsed: 0,
        memUsed: 0,
        diskUsed: 0
      }
    }
  },
  computed: {
    metrics() {
      return [
        {
          key: 'cpu',
          label: this.$t('dashboard.cpuUsed'),
          value: this.percent(this.nodeServerGroupData.cpuUsed),
          tone: 'tone-blue'
        },
        {
          key: 'memory',
          label: this.$t('dashboard.memUsed'),
          value: this.percent(this.nodeServerGroupData.memUsed),
          tone: 'tone-violet'
        },
        {
          key: 'disk',
          label: this.$t('dashboard.diskUsed'),
          value: this.percent(this.nodeServerGroupData.diskUsed),
          tone: 'tone-teal'
        }
      ]
    }
  },
  created() {
    nodeServerState({ id: Cookies.get('nodeServerId') }).then((response) => {
      const { data } = response
      this.nodeServerGroupData = data
    })
  },
  methods: {
    percent(value) {
      return Math.max(0, Math.min(100, Math.round(Number(value) || 0)))
    }
  }
}
</script>

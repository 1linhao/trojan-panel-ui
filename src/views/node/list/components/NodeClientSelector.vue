<template>
  <div class="client-selector">
    <el-checkbox-group
      v-model="nodeProps.clients"
      class="client-selector__grid"
      :aria-label="$t('table.nodeClients').toString()"
    >
      <el-checkbox
        v-for="client in clients"
        :key="client.value"
        :label="client.value"
        border
        class="client-selector__option"
      >
        <span class="client-selector__mark">{{ client.mark }}</span>
        <span>{{ client.label }}</span>
      </el-checkbox>
    </el-checkbox-group>

    <p class="client-selector__hint">
      {{ $t('table.nodeClientsTip') }}
    </p>

    <el-alert
      v-if="showNaiveWarning"
      class="client-selector__warning"
      type="warning"
      :title="$t('table.naiveClientWarning').toString()"
      :closable="false"
      show-icon
    />
  </div>
</template>

<script>
import { isNaiveProxy } from '@/utils/node'

export default {
  name: 'NodeClientSelector',
  props: {
    nodeProps: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      clients: [
        { value: 'sing-box', label: 'sing-box', mark: 'S' },
        { value: 'clash-meta', label: 'Clash.Meta', mark: 'C' },
        { value: 'v2ray', label: 'V2Ray', mark: 'V' }
      ]
    }
  },
  computed: {
    showNaiveWarning() {
      const selected = Array.isArray(this.nodeProps.clients)
        ? this.nodeProps.clients
        : []
      return (
        isNaiveProxy(this.nodeProps) &&
        (selected.includes('clash-meta') || selected.includes('v2ray'))
      )
    }
  }
}
</script>

<style scoped>
.client-selector__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.client-selector__option {
  display: flex;
  align-items: center;
  min-height: 46px;
  margin: 0;
  padding: 0 14px;
  border-radius: 6px;
  transition: border-color 160ms ease, background-color 160ms ease;
}

.client-selector__option.is-checked {
  background: #f0f7ff;
  border-color: #409eff;
}

.client-selector__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 8px;
  color: #405166;
  font-size: 12px;
  font-weight: 700;
  background: #edf1f5;
  border-radius: 4px;
}

.client-selector__option.is-checked .client-selector__mark {
  color: #fff;
  background: #409eff;
}

.client-selector__hint {
  margin: 9px 0 0;
  color: #7b8794;
  font-size: 12px;
  line-height: 1.6;
}

.client-selector__warning {
  margin-top: 10px;
}

@media (max-width: 640px) {
  .client-selector__grid {
    grid-template-columns: 1fr;
  }
}
</style>

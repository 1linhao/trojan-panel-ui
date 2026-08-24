<template>
  <div v-if="formVisibleProps">
    <el-form-item :label="$t('table.naiveUotEnable').toString()">
      <liquid-switch
        v-model="nodeProps.naiveUotEnable"
        :active-value="1"
        :inactive-value="0"
      />
    </el-form-item>
    <el-form-item
      :label="$t('table.naiveUotVersion').toString()"
      v-if="nodeProps.naiveUotEnable === 1"
    >
      <liquid-select v-model="nodeProps.naiveUotVersion">
        <option label="v2" :value="2" />
        <option label="v1" :value="1" />
      </liquid-select>
    </el-form-item>
    <el-form-item>
      <aside>
        {{ $t('table.naiveproxyTip') }}
      </aside>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'NaiveProxyForm',
  props: {
    nodeProps: {
      type: Object,
      require: true
    },
    formVisibleProps: {
      type: Boolean,
      require: true
    }
  }
}
</script>

<style scoped></style>

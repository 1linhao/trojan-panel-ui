<template>
  <el-dialog
    append-to-body
    :title="$t('table.detail').toString()"
    :visible="dialogVisibleProps"
    @close="$emit('update:dialogVisibleProps', false)"
    width="30%"
  >
    <el-form :model="fallbackPrpops" label-position="left">
      <el-form-item label="name">
        <liquid-tag>{{ fallbackPrpops.name }}</liquid-tag>
      </el-form-item>
      <el-form-item label="alpn">
        <liquid-tag>{{ fallbackPrpops.alpn }}</liquid-tag>
      </el-form-item>
      <el-form-item label="path">
        <liquid-tag>{{ fallbackPrpops.path }}</liquid-tag>
      </el-form-item>
      <el-form-item label="dest">
        <liquid-tag>{{ fallbackPrpops.dest }}</liquid-tag>
      </el-form-item>
      <el-form-item label="xver">
        <liquid-tag>{{ fallbackPrpops.xver }}</liquid-tag>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <liquid-button
        type="primary"
        @click="$emit('update:dialogVisibleProps', false)"
        >{{ $t('table.confirm') }}
      </liquid-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'FallbackInfo',
  props: {
    dialogVisibleProps: {
      type: Boolean,
      required: true
    },
    fallbackPrpops: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped></style>

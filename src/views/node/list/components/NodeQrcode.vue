<template>
  <liquid-dialog
    append-to-body
    :title="$t('table.nodeQRCode').toString()"
    :visible="dialogVisibleProps"
    @close="$emit('update:dialogVisibleProps', false)"
  >
    <img class="node-qrcode" :src="qrCodeSrcProps" alt="二维码" />
    <div slot="footer" class="dialog-footer">
      <liquid-button
        tone="accent"
        @click="$emit('update:dialogVisibleProps', false)"
      >
        {{ $t('table.confirm') }}
      </liquid-button>
    </div>
  </liquid-dialog>
</template>

<script>
export default {
  name: 'NodeQrcode',
  props: {
    dialogVisibleProps: {
      type: Boolean,
      required: true
    },
    qrCodeSrcProps: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.node-qrcode {
  display: block;
  width: min(256px, 100%);
  height: auto;
  margin: 0 auto;
  aspect-ratio: 1;
  border-radius: 16px;
}
</style>

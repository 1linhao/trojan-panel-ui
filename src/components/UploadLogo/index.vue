<template>
  <div class="liquid-logo-picker">
    <div v-if="fileList.length" class="liquid-logo-picker__preview">
      <img :src="fileList[0].url" alt="系统 Logo" />
      <button type="button" aria-label="移除 Logo" @click="handleRemove">
        <i class="liquid-icon--delete" aria-hidden="true" />
      </button>
    </div>
    <template v-else>
      <input
        ref="upload"
        class="liquid-logo-picker__native"
        type="file"
        accept=".png"
        @change="handleNativeFile"
      />
      <liquid-button icon="liquid-icon--plus" @click="$refs.upload.click()">
        选择 Logo
      </liquid-button>
    </template>
    <div class="liquid-logo-picker__tip ui-supporting-text">
      {{ $t('config.imageFileTip') }}
    </div>
  </div>
</template>

<script>
import { Message } from '@/utils/liquid-feedback'
import { uploadLogo } from '@/api/system'

export default {
  name: 'LogoUploader',
  data() {
    return {
      fileList: [{ name: 'logo.png', url: '/api/image/logo' }],
      uploadDisable: true
    }
  },
  watch: {
    fileList: function (val) {
      this.uploadDisable = val.length >= 1
    }
  },
  methods: {
    handleNativeFile(event) {
      const file = event.target.files[0]
      if (!file || this.beforeUpload(file) === false) {
        event.target.value = ''
        return
      }
      const item = { name: file.name, raw: file, url: URL.createObjectURL(file) }
      this.fileList = [item]
      this.uploadFile({ file })
    },
    handleRemove() {
      this.fileList = []
    },
    beforeUpload(file) {
      const isJPG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 3

      if (!isJPG) {
        Message({
          message: this.$t('confirm.uploadWebFileFormat'),
          type: 'error',
          duration: 5 * 1000
        })
      }
      if (!isLt2M) {
        Message({
          message: this.$t('confirm.uploadWebFileSize'),
          type: 'error',
          duration: 5 * 1000
        })
      }
      return isJPG && isLt2M
    },
    uploadFile(params) {
      if (this.fileList.length > 0) {
        let formData = new FormData()
        formData.append('file', params.file || this.fileList[0].raw)
        uploadLogo(formData).then(() => {
          this.$notify({
            title: 'Success',
            message: this.$t('confirm.modifySuccess'),
            type: 'success',
            duration: 2000
          })
        })
      }
    }
  }
}
</script>
<style scoped>
.liquid-logo-picker {
  display: grid;
  gap: 8px;
  justify-items: start;
}
.liquid-logo-picker__native {
  display: none;
}
.liquid-logo-picker__preview {
  position: relative;
  width: 112px;
  height: 112px;
  overflow: hidden;
  border: 1px solid var(--rim);
  border-radius: 20px;
  background: var(--control-fill);
  box-shadow: inset 0 1px 0 var(--spec-soft), var(--shadow-soft);
}
.liquid-logo-picker__preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.liquid-logo-picker__preview button {
  position: absolute;
  right: 7px;
  bottom: 7px;
  width: 30px;
  height: 30px;
  border: 1px solid var(--rim);
  border-radius: 10px;
  color: var(--bad-fg);
  background: var(--glass-popover);
  cursor: pointer;
}
</style>

<template>
  <div class="app-container">
    <div class="liquid-file-picker">
      <input
        ref="upload"
        class="liquid-file-picker__native"
        type="file"
        accept=".zip"
        @change="handleNativeFile"
      />
      <liquid-button type="primary" @click="$refs.upload.click()">
        {{ $t('config.webFileSelect') }}
      </liquid-button>
      <liquid-button
        @click="submitUpload"
        :disabled="fileList.length === 0"
      >
        {{ $t('config.webFileBtn') }}
      </liquid-button>
      <span v-if="fileList.length" class="liquid-file-picker__name">
        {{ fileList[0].name }}
      </span>
      <div class="liquid-file-picker__tip">
        {{ $t('config.webFileTip') }}
      </div>
    </div>
  </div>
</template>

<script>
import { uploadWebFile } from '@/api/system'
import { Message } from '@/utils/liquid-feedback'

export default {
  name: 'web-file',
  data() {
    return {
      fileList: []
    }
  },
  methods: {
    handleNativeFile(event) {
      const file = event.target.files[0]
      if (!file || this.beforeUpload(file) === false) {
        event.target.value = ''
        return
      }
      this.fileList = [{ name: file.name, raw: file }]
    },
    submitUpload() {
      if (this.fileList.length) this.uploadFile({ file: this.fileList[0].raw })
    },
    uploadFile(params) {
      let formData = new FormData()
      formData.append('file', params.file)
      uploadWebFile(formData).then(() => {
        this.$notify({
          title: 'Success',
          message: this.$t('confirm.uploadWebFileSuccess'),
          type: 'success',
          duration: 2000
        })
      })
      this.fileList = []
    },
    beforeUpload(file) {
      if (!file.name.endsWith('.zip')) {
        Message({
          message: this.$t('confirm.uploadWebFileFormat'),
          type: 'error',
          duration: 5 * 1000
        })
        return false
      }
      if (file.size / 1024 / 1024 > 10) {
        Message({
          message: this.$t('confirm.uploadWebFileSize'),
          type: 'error',
          duration: 5 * 1000
        })
        return false
      }
    }
  }
}
</script>

<style scoped>
.liquid-file-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.liquid-file-picker__native {
  display: none;
}
.liquid-file-picker__name {
  color: var(--ink-2);
  font-size: 12px;
}
.liquid-file-picker__tip {
  flex-basis: 100%;
  color: var(--ink-3);
  font-size: 11.5px;
}
</style>

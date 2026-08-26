<template>
  <liquid-dialog
    append-to-body
    :title="$t('table.import')"
    :visible="dialogFormVisible"
    @close="$emit('update:dialogFormVisible', false)"
  >
    <liquid-form ref="dataForm" :rules="rules" :model="temp" label-position="left">
      <liquid-form-item :label="label" prop="cover">
        <liquid-switch
          v-model="temp.cover"
          :active-text="$t('table.yes')"
          :inactive-text="$t('table.no')"
          :active-value="1"
          :inactive-value="0"
        >
        </liquid-switch>
      </liquid-form-item>
      <liquid-form-item :label="$t('config.webFileSelect')" prop="file">
        <div class="liquid-file-picker">
          <input
            ref="upload"
            class="liquid-file-picker__native"
            type="file"
            accept=".json"
            @change="handleNativeFile"
          />
          <liquid-button tone="accent" @click="$refs.upload.click()">
            {{ $t('config.webFileSelect') }}
          </liquid-button>
          <liquid-button
            icon="liquid-icon--download"
            @click="downloadTemplate"
          >
            {{ $t('table.downloadTemplate') }}
          </liquid-button>
          <span v-if="fileList.length" class="liquid-file-picker__name">
            {{ fileList[0].name }}
          </span>
          <div class="liquid-file-picker__tip">
            {{ $t('config.jsonFileTip') }}
          </div>
        </div>
      </liquid-form-item>
    </liquid-form>
    <div slot="footer" class="dialog-footer">
      <liquid-button @click="$emit('update:dialogFormVisible', false)">
        {{ $t('table.cancel') }}
      </liquid-button>
      <liquid-button
        tone="accent"
        @click="submitImport"
        :disabled="fileList.length === 0"
      >
        {{ $t('table.confirm') }}
      </liquid-button>
    </div>
  </liquid-dialog>
</template>

<script>
import { Message } from '@/utils/liquid-feedback'

export default {
  name: 'index',
  props: {
    dialogFormVisible: {
      type: Boolean,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    importData: {
      type: Function,
      required: true
    },
    downloadTemplate: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      temp: {
        cover: 0
      },
      fileList: [],
      rules: {
        cover: [
          {
            required: true,
            message: this.$t('valid.cover'),
            trigger: ['change', 'blur']
          }
        ]
      }
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
    beforeUpload(file) {
      if (!file.name.endsWith('.json')) {
        Message({
          message: this.$t('confirm.uploadWebFileFormat'),
          type: 'error',
          duration: 5 * 1000
        })
        return false
      }
      if (file.size / 1024 / 1024 > 10) {
        Message({
          message: this.$t('confirm.uploadWebFileSize').toString(),
          type: 'error',
          duration: 5 * 1000
        })
        return false
      }
    },
    submitImport() {
      if (this.fileList.length) {
        this.importData({ file: this.fileList[0].raw })
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

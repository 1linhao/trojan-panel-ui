<template>
  <liquid-dropdown
    trigger="click"
    class="international"
    @command="handleSetLanguage"
  >
    <div>
      <svg-icon class-name="international-icon" icon-class="language" />
    </div>
    <liquid-dropdown-menu slot="dropdown">
      <liquid-dropdown-item :disabled="language === 'zh'" command="zh">
        中文
      </liquid-dropdown-item>
      <liquid-dropdown-item :disabled="language === 'en'" command="en">
        English
      </liquid-dropdown-item>
      <liquid-dropdown-item :disabled="language === 'ko'" command="ko">
        한국인
      </liquid-dropdown-item>
      <liquid-dropdown-item :disabled="language === 'fa'" command="fa">
        فارسی
      </liquid-dropdown-item>
    </liquid-dropdown-menu>
  </liquid-dropdown>
</template>

<script>
export default {
  computed: {
    language() {
      return this.$store.getters.language
    }
  },
  methods: {
    handleSetLanguage(lang) {
      this.$i18n.locale = lang
      this.$store.dispatch('app/setLanguage', lang)
      this.$message({
        message: 'Switch Language Success',
        type: 'success'
      })
    }
  }
}
</script>

<template>
  <div class="prototype-page">
    <ui-panel class="profile-card" motion-key="account-profile">
      <div class="card-head">
        <div>
          <span class="kicker">Account Security</span>
          <h2>个人资料</h2>
        </div>
      </div>
      <div class="seg liquid-tabs" role="tablist" aria-label="个人资料">
        <button type="button" :class="{ on: activeName === 'modify-pass' }"
          @click="activeName = 'modify-pass'">修改密码</button>
        <button type="button" :class="{ on: activeName === 'modify-property' }"
          @click="activeName = 'modify-property'">账号属性</button>
        <button type="button" :class="{ on: activeName === 'color-theme' }"
          @click="activeName = 'color-theme'">颜色主题</button>
      </div>
      <ModifyPass v-if="activeName === 'modify-pass'" />
      <ModifyProperty v-else-if="activeName === 'modify-property'" />
      <LiquidPalettePicker v-else inline />
    </ui-panel>
  </div>
</template>

<script>
import ModifyPass from '@/views/account/modify/components/ModifyPass'
import ModifyProperty from '@/views/account/modify/components/ModifyProperty'
import LiquidPalettePicker from '@/components/LiquidPalettePicker'

export default {
  name: 'ProfilePage',
  components: { ModifyProperty, ModifyPass, LiquidPalettePicker },
  data() {
    return {
      activeName: 'modify-pass'
    }
  }
}
</script>

<style scoped></style>

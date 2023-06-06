<template>
  <header id="header">
    <TheSettings v-if="isSettingOpen"/>
    <div id="header-main" :class="`engine_${engine}`">
      <div class="container header-card">
        <!-- <TheHeaderUpper @logo-click="$emit('logo-click')"/> -->
        <TheHeaderLower style="margin-top: 20px;" />
      </div>
    </div>
  </header>
</template>

<script>
import {mapState} from 'vuex'
import TheSettings from '@/components/TheSettings'
import TheHeaderUpper from '@/components/TheHeaderUpper'
import TheHeaderLower from '@/components/TheHeaderLower'

export default {
  name: 'TheHeader',
  components: {
    TheSettings,
    TheHeaderUpper,
    TheHeaderLower
  },
  computed: {
    ...mapState({
      engine: state => state.hash.engine,
      isSettingOpen: state => state.isSettingOpen
    })
  }
}
</script>

<style scoped>
.header-card {
    border-radius: 8px;
    background-color: white;
    padding: 12px 8px 8px 8px;
}
</style>

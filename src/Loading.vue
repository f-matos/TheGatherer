<template>
<div id="loading">
    <el-progress type="circle" :percentage="progress"></el-progress>
</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Loading extends Vue {
  get progress() {
    console.log("??");
    if (this.$store.state.loadTotal === 0) {
      return 0;
    }
    return this.$store.state.loadDone / this.$store.state.loadTotal;
  }
}
</script>
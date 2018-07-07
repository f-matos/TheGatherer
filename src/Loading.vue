<template>
<div id="loading">
    <el-progress type="circle" :percentage="percentage"></el-progress>
    <div>{{ progress }}</div>
</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Loading extends Vue {
  get percentage() {
    if (this.$store.state.loadTotal === 0) {
      return 0;
    }
    return Math.round(
      (this.$store.state.loadDone * 100) / this.$store.state.loadTotal
    );
  }

  get progress() {
    return `${this.$store.state.loadDone} / ${this.$store.state.loadTotal}`;
  }
}
</script>

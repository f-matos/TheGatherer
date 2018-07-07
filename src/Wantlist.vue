<template>
    <div>
        <div>{{`Cards wanted: ${cardsWanted}`}}</div>
        <div>
        <el-card v-for="(quantity, name) in wantlist" shadow="never" :key="name"
        v-bind:class="quantity == 0 ? 'bg-success' : ''">
            {{`${name} --- ${quantity}`}}
        </el-card>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class WantList extends Vue {
  get wantlist() {
    return this.$store.state.selectedCart.wantlist;
  }

  get cardsWanted() {
    let counter = 0;
    for (const k in this.$store.state.wantlist) {
      counter += this.$store.state.wantlist[k];
    }
    return counter;
  }
}
</script>
<style>
.bg-success {
  background-color: #13ce66;
}
</style>

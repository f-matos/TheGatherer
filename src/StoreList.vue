<template>
    <div class="store-container">
<div v-for="store in this.$store.getters.sortedStores" :key="store.name">
             <el-button @click="click(store)" v-bind:type="active(store)" class="store-button">
                 <img :src="store.logo" width="100px" height="30px" />
                 {{ `(${store.rating})` }}
             </el-button>
        </div>

    </div>
</template>
<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import { Store } from "./models";

@Component
export default class StoreList extends Vue {
  active(store: Store) {
    if (store === this.$store.state.selectedStore) {
      return "primary";
    } else {
      return "";
    }
  }

  click(store: Store) {
    this.$store.mutations.selectStore(store);
  }
}
</script>
<style>
.store-container {
}
.store-button {
  width: 100%;
}
</style>

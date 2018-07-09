<template>
  <div class="store-container">
    <el-select v-model="selectedShop" placeholder="Filter Shops"
          filterable auto-complete clearable>
          <el-option
            v-for="shop in shops"
            :key="shop.name"
            :label="shop.name"
            :value="shop.name">
          </el-option>
        </el-select>
    <div v-for="store in filteredShops" :key="store.name">
      <el-button @click="click(store)" v-bind:type="active(store)" class="store-button">
        <StoreLogo :logo="store.logo"></StoreLogo>
        {{ `${store.rating} | ${store.onCart}`}}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import _ from "lodash";
import StoreLogo from "./StoreLogo.vue";
import { Store } from "./models";

@Component({
  components: { StoreLogo }
})
export default class StoreList extends Vue {
  selectedShop: string = "";

  active(store: Store) {
    if (store === this.$store.state.selectedStore) {
      return "primary";
    } else {
      return "";
    }
  }

  get filteredShops() {
    if (this.selectedShop != "") {
      return [this.$store.state.stores[this.selectedShop]];
    }
    let data: Array<Store> = [];
    let filter = this.$store.state.shopFilter;
    if (filter === "") {
      return this.$store.getters.sortedStores;
    }
    this.$store.getters.sortedStores.forEach((shop: Store) => {
      if (filter in shop.cards) {
        data.push(shop);
      }
    });
    return data;
  }

  get shops() {
    return _.values(this.$store.state.stores);
  }

  click(store: Store) {
    this.$store.mutations.selectStore(store);
  }
}
</script>
<style>
.store-button {
  width: 100%;
}
</style>

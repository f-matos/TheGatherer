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
    <div v-for="shop in filteredShops" :key="shop.name">
      <StoreView shop="shop"></StoreView>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import _ from "lodash";
import StoreView from "./components/StoreView.vue";
import { Shop } from "./models/Shop";

@Component({
  components: { StoreView }
})
export default class StoreList extends Vue {
  selectedShop: string = "";

  get filteredShops() {
    if (this.selectedShop != "") {
      return [this.$store.state.shops[this.selectedShop]];
    }
    let data: Array<Shop> = [];
    let filter = this.$store.state.shopFilter;
    this.$store.state.shops.forEach((shop: Shop) => {
      const pos = _.sortedIndexBy(data, shop, "rating");
      data.splice(pos, 0, shop);
      /*
      if (filter in shop.cards) {
        data.push(shop);
      }
      */
    });
    return data;
  }

  get shops() {
    return _.values(this.$store.state.shops);
  }
}
</script>

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
      <ShopView :shop="shop"></ShopView>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import _ from "lodash";
import ShopView from "./components/ShopView.vue";
import { Shop } from "./models";

@Component({
  components: { ShopView }
})
export default class StoreList extends Vue {
  selectedShop: string = "";

  get filteredShops() {
    if (this.selectedShop != "") {
      return [this.$store.state.shops[this.selectedShop]];
    }
    let data: Array<Shop> = [];
    let filter = this.$store.state.shopFilter;
    /*
    _.forIn(this.$store.state.shops, (shop: Shop) => {
      const pos = _.sortedIndexBy(data, shop, "rating");
      data.splice(pos, 0, shop);
      if (filter in shop.cards) {
        data.push(shop);
      }

    });*/
    return _.orderBy(
      this.$store.state.shops,
      ["rating", "name"],
      ["desc", "asc"]
    );
  }

  get shops() {
    return _.values(this.$store.state.shops);
  }
}
</script>

<template>
  <div class="store-container">

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
      return [this.$store.state.shops.find(s => s.name == this.selectedShop)];
    }
    const filters = this.$store.state.filters;
    return _.chain(this.$store.state.shops)
      .filter(shop => {
        if (filters.cardname != "") {
          return shop.cards.some(shopCard => {
            return shopCard.card.name === filters.cardname;
          });
        }
        if (filters.shopname != "") {
          return shop.name === filters.shopname;
        }
        return true;
      })
      .orderBy(["rating", "name"], ["desc", "asc"])
      .value();
  }

  get shops() {
    return _.values(this.$store.state.shops);
  }
}
</script>

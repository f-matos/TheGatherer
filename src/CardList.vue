<template>
<div>
        <div v-if="store != undefined">
            <img :src="store.logo" width="100px" height="30px" />
                 {{ `${store.name}` }}
        </div>
    <div v-for="shopCard in shopCards" :key="shopCard.card.id">
        <el-button class="card-button" @click="addCard(shopCard)"
        :type="cardColor(shopCard)" >
            {{ `${shopCard.card.name} (${shopCard.stock}) ${shopCard.card.money} ${shopCard.card.quality}` }}
        </el-button>
    </div>
</div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import _ from "lodash";
import { ShopCard, formatter } from "@/models";

@Component
export default class CardList extends Vue {
  get shopCards() {
    if (this.$store.state.currentShop === undefined) {
      return [];
    }
    const filters = this.$store.state.filters;
    return _.chain(this.$store.state.currentShop.cards).filter(shopCard => {
      return shopCard.card.price <= filters.maxPrice && shopCard.card.price >= filters.minPrice
    }).orderBy(o => o.card.name).value()    
  }

  get store() {
    return this.$store.state.currentShop;
  }

  addCard(shopCard: ShopCard) {
    this.$store.mutations.addItemToCart(shopCard.card);
  }

  cardColor(shopCard: ShopCard) {
    const cart = this.$store.state.currentCart;
    const isMissing = this.$store.state.wantlist.missing.forEach(missing => {
      if (missing.name == shopCard.card.name) {
        if (missing.amount > 0) {
          return true;
        }
      }
      return false;
    });
    return isMissing ? "info" : "";
  }
}
</script>
<style>
.card-button {
  width: 100%;
}
</style>

<template>
<div>
        <div v-if="store != undefined">
            <img :src="store.logo" width="100px" height="30px" />
                 {{ `${store.name}` }}
        </div>
    <div v-for="card in cards" :key="card.id">
        <el-button class="card-button" @click="addCard(card)"
        :type="cardColor(card)" >
            {{ `${card.name} (${card.stock}) ${card.money} ${card.quality}` }}
        </el-button>
    </div>
</div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import _ from "lodash";
import { Card, formatter } from "./models";

@Component
export default class CardList extends Vue {
  get cards() {
    if (this.$store.state.currentShop === undefined) {
      return [];
    }
    return _.sortBy(this.$store.state.currentShop.cards, ["rating"]);
  }

  get store() {
    return this.$store.state.currentShop;
  }

  addCard(card: Card) {
    this.$store.mutations.addItemToCart(card);
  }

  cardColor(card: Card) {
    const cart = this.$store.state.currentCart;
    if (card.id in cart.items) {
      if (cart.items[card.id].amount < this.$store.state.wantlist[card.name]) {
        if (name in this.$store.state.currentShop.cards) {
          return "info";
        }
      }
    }
    return "";
  }
}
</script>
<style>
.card-button {
  width: 100%;
}
</style>

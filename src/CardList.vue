<template>
<div>
        <div v-if="store.name !== ''">
            <img :src="store.logo" width="100px" height="30px" />
                 {{ `${store.name}` }}
        </div>
    <div v-for="card in cards" :key="card.name">
        <el-button class="card-button" @click="addCard(card)"
        :type="cardColor(card.name)" >
            {{ `${card.name} (${card.stock}) ${card.priceShown} ${card.quality}` }}
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
    let data: Array<Card> = [];
    _.forIn(this.$store.state.selectedStore.cards, (card: Card) => {
      const entry = Object.assign({}, card, {
        priceShown: formatter.format(card.price)
      });
      const pos = _.sortedIndexBy(data, entry, "name");
      data.splice(pos, 0, entry);
    });
    return data;
  }

  get store() {
    return this.$store.state.selectedStore;
  }

  addCard(card: Card) {
    this.$store.mutations.addCardToCart(card);
  }

  cardColor(name: string) {
    if (this.$store.state.selectedCart.wantlist[name] > 0) {
      if (name in this.$store.state.selectedStore.cards) {
        return "info";
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

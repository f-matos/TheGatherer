<template>
<div>
        <div v-if="store.name !== ''">
            <img :src="store.logo" width="100px" height="30px" />
                 {{ `${store.name}` }}
        </div>
    <div v-for="card in cards" :key="card.name">
        <el-button class="card-button" @click="addCard(card)" >
            {{ `${card.name} (${card.stock}) ${card.price} ${card.quality}` }}
        </el-button>
    </div>
</div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import WantList from "./WantList.vue";
import { Card } from "./models";

@Component({
  components: {
    WantList
  }
})
export default class CardList extends Vue {
  get cards() {
    let data: Array<Card> = [];
    _.forIn(this.$store.state.selectedStore.cards, (card: Card) => {
      const pos = _.sortedIndexBy(data, card, "name");
      data.splice(pos, 0, card);
    });
    return data;
  }

  get store() {
    return this.$store.state.selectedStore;
  }

  addCard(card: Card) {
    this.$store.mutations.addCardToCart(card);
  }
}
</script>
<style>
.card-button {
  width: 100%;
}
</style>

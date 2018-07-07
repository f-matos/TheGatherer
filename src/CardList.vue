<template>
<div>
        <div v-if="store.name !== ''">
            <img :src="store.logo" width="100px" height="30px" />
                 {{ `${store.name}` }}
        </div>
    <div v-for="card in cards" :key="card.name">
        <el-button class="card-button" @click="addCard(card)" >
            {{ `${card.name} (${card.stock}) ${card.price}`  }}
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
    return this.$store.state.selectedStore.cards;
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

<template>
    <div>
        <div>{{`Cards wanted: ${cardsWanted}`}}</div>
        <div>
        <el-card v-for="data in wantlist" shadow="never" :key="data.name"
        v-bind:body-style="data.style">
        <div @click="setFilter(data.name)">
            {{`${data.name} | ${data.owned}/${data.wanted} | ${data.bestPrice}`}}
            <div>
              <img :src="data.logo" width="100px" height="30px" />
            </div>
          </div>
        </el-card>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { formatter, Card, WantlistCard } from "@/models";
import _ from "lodash";

@Component
export default class WantList extends Vue {
  get wantlist() {
    const wantlist = this.$store.state.wantlist;
    const data: Array<any> = [];

    wantlist.cards.forEach(card => {
      const best = this.$store.state.bestShop[card.name];
      const bg = card.isSatisfied ? "#13ce66" : "";
      let style = { cursor: "pointer", "background-color": bg };
      let entry = {
        name: card.name,
        owned: card.amountOwned,
        wanted: card.amountWanted,
        bestPrice: formatter.format(best.price),
        logo: best.shop.logo,
        style: style
      };
      const pos = _.sortedIndexBy(data, entry, "name");
      data.splice(pos, 0, entry);
    });
    return data;
  }

  get cards() {
    return _.keys(this.$store.state.wantlist);
  }

  setFilter(name: string) {
    this.$store.mutations.setCardnameFilter(name);
  }

  get cardsWanted() {
    return _.reduce(
      this.$store.state.wantlist.cards,
      (result, card) => result + card.amountWanted,
      0
    );
  }
}
</script>

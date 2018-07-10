<template>
    <div>
        <div>{{`Cards wanted: ${cardsWanted}`}}</div>
        <el-select v-model="filter" placeholder="Filter Shops by Card"
          filterable auto-complete clearable>
          <el-option
            v-for="card in cards"
            :key="card"
            :label="card"
            :value="card">
          </el-option>
        </el-select>
        <div>
        <el-card v-for="data in wantlist" shadow="never" :key="data.name"
        v-bind:body-style="data.style">
        <div @click="setFilter(data.name)">
            {{`${data.name} | ${data.amount} | ${data.bestPrice}`}}
            <img :src="data.logo" width="100px" height="30px" />
          </div>
        </el-card>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { formatter, Card } from "@/models";
import _ from "lodash";

@Component
export default class WantList extends Vue {
  get wantlist() {
    const wantlist = this.$store.state.wantlist;
    const data: Array<any> = [];
    for (const cardname in wantlist) {
      const best = this.$store.state.bestShop[cardname];
      const bg = wantlist[cardname] === 0 ? "#13ce66" : "";
      let style = { cursor: "pointer", "background-color": bg };
      let entry = {
        name: cardname,
        amount: this.amount(cardname),
        bestPrice: formatter.format(best.price),
        logo: best.shop.logo,
        style: style
      };
      const pos = _.sortedIndexBy(data, entry, "name");
      data.splice(pos, 0, entry);
    }
    return data;
  }

  amount(cardname: string) {
    let amount = this.$store.state.wantlist[cardname];
    const cart = this.$store.state.currentCart;
    _.forIn(cart.items, item => {
      if (item.cardname === cardname) {
        amount -= item.amount;
      }
    });
    return amount;
  }

  get filter() {
    return this.$store.state.shopFilter;
  }

  set filter(value: string) {
    this.$store.mutations.setShopFilter(value);
  }

  get cards() {
    return _.keys(this.$store.state.wantlist);
  }

  setFilter(name: string) {
    this.$store.mutations.setShopFilter(name);
  }

  get cardsWanted() {
    let counter = 0;
    for (const k in this.$store.state.wantlist) {
      counter += this.$store.state.wantlist[k];
    }
    return counter;
  }
}
</script>

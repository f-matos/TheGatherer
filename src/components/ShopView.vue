<template>
  <div @click="shopClick">
    <el-card shadow="hover" :body-style="style">
      <img :src="shop.logo" width="100px" height="30px" />
      <div>
      {{ `${shop.score} | ${shop.amountInCart}`}}
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import _ from "lodash";
import StoreLogo from "./StoreLogo.vue";
import { Shop } from "@/models";

@Component
export default class ShopView extends Vue {
  @Prop() shop!: Shop;

  get style() {
    let bg: any = { cursor: "pointer" };
    if (this.$store.state.currentShop === this.shop) {
      bg["background-color"] = "#409EFF";
    }
    return bg;
  }

  shopClick() {
    this.$store.mutations.selectShop(this.shop);
  }
}
</script>

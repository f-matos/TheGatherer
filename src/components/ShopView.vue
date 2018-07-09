<template>
  <div @click="shopClick" :body-style="style">
    <el-card shadow="hover">
      <StoreLogo :logo="store.logo"></StoreLogo>
      {{ `${shop.rating} | ${shop.onCart}`}}
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import _ from "lodash";
import StoreLogo from "./StoreLogo.vue";
import { Shop } from "./models/Shop";

@Component({
  components: { StoreLogo }
})
export default class ShopView extends Vue {
    @Prop() shop!: Shop

    get style(){
      let bg: any = {cursor: "pointer"};
      if(this.$store.state.currentShop === this.shop){
        bg['background-color'] = 'bg-success';
      }
      return bg;
    }

    shopClick(){
      this.$store.mutations.selectShop(this.shop);
    }
</script>

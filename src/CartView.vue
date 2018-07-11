<template>
    <div>
       <el-tabs type="card" v-model="activeTab" editable @tab-add="addCart" @tab-remove="removeCart">
        <el-tab-pane
            v-for="(cart, id) in carts"
            :key="id"
            :name="`carttab${id}`"
            :label="cartText(cart)"
        ></el-tab-pane>
            <el-table
            :data="cartData"
            empty-text="Cart empty"
            @row-click="rowClick">
            <el-table-column
                prop="card.name"
                label="Name"
                width="100">
            </el-table-column>
            <el-table-column
                label="Store"
                width="110">
                <template slot-scope="scope">
                    <img :src="scope.row.shop.logo" width="100px" height="30px" />
                    </template>
            </el-table-column>
            <el-table-column
                prop="money"
                label="Price">
            </el-table-column>
            <el-table-column
                prop="amount"
                label="Amount">
            </el-table-column>
            <el-table-column column-key="remove">
                <template slot-scope="scope">
                  <i class="el-icon-remove"></i>
                  </template>
            </el-table-column>
            </el-table>
            <div>
                {{ cartText() }}
             </div>
             <el-button type="primary" @click="openAll()" >OpenAll</el-button>

</el-tabs>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import _ from "lodash";
import { formatter } from "@/models";
import { Cart, Card, CartCard } from "./models";

@Component
export default class CartView extends Vue {
  cartText(cart: Cart) {
    if (cart === undefined) {
      cart = this.$store.state.currentCart;
    }
    let shops = new Set();
    let price = 0;
    let amount = 0;
    cart.items.forEach(item => {
      shops.add(item.shop);
      amount += item.amount;
    });
    return `${shops.size} | ${amount} | ${cart.money}`;
  }

  get carts() {
    return this.$store.state.carts;
  }

  get activeTab() {
    return `carttab${this.$store.state.carts.indexOf(
      this.$store.state.currentCart
    )}`;
  }

  set activeTab(value: string) {
    const match = /.*([0-9]+)$/.exec(value);
    if (match != null) {
      this.$store.mutations.selectCart(parseInt(match[1]));
    }
  }

  get cartData() {
    const cart = this.$store.state.currentCart;
    let data: Array<CartCard> = [];
    data = cart.items.slice(0);
    data.sort((a, b) => a.shop.name.localeCompare(b.shop.name));
    return data;
  }

  rowClick(row: CartCard, event: any, column: any) {
    if (column.columnKey === "remove") {
      this.$store.mutations.removeItemFromCart(row);
    }
    if (column.label === "Store") {
      window.open(
        "https://www.ligamagic.com.br/" + row.card.referral,
        "_blank"
      );
    }
  }

  openAll() {
    this.$store.state.currentCart.items.forEach(item =>
      window.open(
        "https://www.ligamagic.com.br/" + item.card.referral,
        "_blank"
      )
    );
  }

  removeCart(id: string) {
    const match = /.*([0-9]+)$/.exec(id);
    if (match != null) {
      this.$store.mutations.removeCart(parseInt(match[1]));
    }
  }

  addCart() {
    this.$store.mutations.addCart();
  }
}
</script>

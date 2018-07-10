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
                prop="name"
                label="Name"
                width="100">
            </el-table-column>
            <el-table-column
                label="Store"
                width="110">
                <template slot-scope="scope">
                    <img :src="scope.row.logo" width="100px" height="30px" />
                    </template>
            </el-table-column>
            <el-table-column
                prop="price"
                label="Price">
            </el-table-column>
            <el-table-column
                prop="quantity"
                label="Quantity">
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
import { Cart, Card, CartItem } from "./models";

@Component
export default class CartView extends Vue {
  cartText(cart: Cart) {
    if (cart === undefined) {
      cart = this.$store.state.currentCart;
    }
    let shops = new Set();
    let price = 0;
    let amount = 0;
    _.forIn(cart.items, item => {
      shops.add(item.card.shop);
      price += item.price;
      amount += item.amount;
    });
    return `${shops.size} | ${amount} | ${formatter.format(price)}`;
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
    let data: Array<CartItem> = [];
    _.forIn(cart.items, item => {
      const logo = item.card.shop.logo;
      const price = item.card.money;
      const entry = Object.assign({}, item, { logo: logo, price: price });
      const pos = _.sortedIndexBy(data, entry, o => {
        return o.card.shop.name;
      });
      data.splice(pos, 0, entry);
    });
    return data;
  }

  rowClick(row: CartItem, event: any, column: any) {
    console.log(column);
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
    _.forIn(this.$store.state.currentCart.items, item => {
      const referral = item.card.referral;
      window.open("https://www.ligamagic.com.br/" + referral, "_blank");
    });
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

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
            @row-click="rowClick">
            <el-table-column
                prop="name"
                label="Name"
                width="180">
            </el-table-column>
            <el-table-column
                prop="store"
                label="Store"
                width="180">
            </el-table-column>
            <el-table-column
                prop="price"
                label="Price">
            </el-table-column>
            <el-table-column
                prop="quantity"
                label="Quantity">
            </el-table-column>
            <el-table-column
                label="Remove">
                    <template slot-scope="scope">
                        <i class="el-icon-remove"></i>
                    </template>
            </el-table-column>
            </el-table>
            <div>
                {{ cartText() }}
             </div>

</el-tabs>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import _ from "lodash";
import { Cart, Card, CartItem } from "./models";

@Component
export default class CartView extends Vue {
  cartText(cart: Cart) {
    if (cart === undefined) {
      cart = this.$store.state.selectedCart;
    }
    let stores = new Set();
    let price = 0;
    let cards = 0;
    for (const key in cart.items) {
      const item = cart.items[key];
      stores.add(item.store);
      price += item.price * item.quantity;
      cards += item.quantity;
    }
    return `${stores.size} | ${cards} | ${price.toFixed(2)}`;
  }

  get carts() {
    return this.$store.state.carts;
  }

  get activeTab() {
    return `carttab${this.$store.state.carts.indexOf(
      this.$store.state.selectedCart
    )}`;
  }

  set activeTab(value: string) {
    const match = /.*([0-9]+)$/.exec(value);
    if (match != null) {
      this.$store.mutations.selectCart(parseInt(match[1]));
    }
  }

  get cartData() {
    const cart = this.$store.state.selectedCart;
    let data: Array<CartItem> = [];
    _.forIn(cart.items, (item: CartItem) => {
      const pos = _.sortedIndexBy(data, item, "name");
      data.splice(pos, 0, item);
    });
    return data;
  }

  rowClick(row: CartItem, event: any, column: any) {
    if (column.label === "Remove") {
      this.$store.mutations.removeItemFromCart(row);
    }
    if (column.label === "Store") {
      window.open("https://www.ligamagic.com.br/" + row.referral, "_blank");
    }
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

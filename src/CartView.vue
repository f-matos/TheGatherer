<template>
    <div>
       <el-tabs type="card" editable @tab-click="changeCart" @tab-add="addCart" @tab-remove="removeCart">
        <el-tab-pane
            v-for="(cart, id) in carts"
            :value="activeTab"
            :key="id"
            :name="`${id}`"
            :label="cartText(cart)"
        >
            <el-table
            :data="cartData(cart)"
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
                {{ cartText(cart) }}
             </div>
    </el-tab-pane>
</el-tabs>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Cart, CartItem, Card } from "./models";

@Component
export default class CartView extends Vue {
  cartText(cart: Cart) {
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
    return `tab-${this.$store.state.carts.indexOf(
      this.$store.state.selectedCart
    )}`;
  }

  cartData(cart: Cart) {
    let data: Array<CartItem> = [];
    for (const key in cart.items) {
      data.push(cart.items[key]);
    }
    return data;
  }

  rowClick(row: Card, event: any, column: any) {
    if (column.label === "Remove") {
      this.$store.mutations.removeCardFromCart(row);
    }
  }

  removeCart(id: number) {
    this.$store.mutations.removeCart(id);
  }

  addCart() {
    this.$store.mutations.addCart();
  }

  changeCart(tab: any) {
    this.$store.mutations.selectCart(this.$store.state.carts[tab.name]);
  }
}
</script>

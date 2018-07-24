<template>
    <div>
        <el-row>
            <el-col :span="16" :offset="8">
                    <div style="float:left">
                        <div>
                            <el-select 
                                v-model="shopname" placeholder="Filtrar Loja"
                                filterable auto-complete clearable>
                                <el-option
                                    v-for="shop in allShops"
                                    :key="shop"
                                    :label="shop"
                                    :value="shop">
                                </el-option>
                            </el-select>                            
                            <el-col :span="12">
                            <el-input v-model="maxPrice">
                                <template slot="prepend">Preço Máximo</template>
                            </el-input>
                            </el-col>
                        </div>
                        <div>
                            <el-col :span="12">
                            <el-input v-model="minPrice">
                                <template slot="prepend">Preço Mínimo</template>
                            </el-input>            
                            </el-col>
                            <el-select v-model="cardname" placeholder="Filtrar carta"
                                filterable auto-complete clearable>
                                <el-option
                                    v-for="card in allCards"
                                    :key="card"
                                    :label="card"
                                    :value="card">
                                </el-option>
                            </el-select>                            
                        </div>
                    </div>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import _ from "lodash";

@Component
export default class FilterOptions extends Vue {
  get allCards() {
    return _.map(this.$store.state.wantlist.cards, c => c.name);
  }

  get allShops() {
    return _.map(this.$store.state.shops, s => s.name);
  }

  get cardname() {
    return this.$store.state.filters.cardname;
  }

  set cardname(name: string) {
    this.$store.mutations.setCardnameFilter(name);
  }

  get shopname() {
    return this.$store.state.filters.shopname;
  }

  set shopname(name: string) {
    this.$store.mutations.setShopnameFilter(name);
  }

  get minPrice() {
    return this.$store.state.filters.minPrice;
  }

  set minPrice(value: string) {
    this.$store.mutations.setMinPrice(value);
  }

  get maxPrice() {
    return this.$store.state.filters.maxPrice;
  }

  set maxPrice(value: string) {
    this.$store.mutations.setMaxPrice(value);
  }
}
</script>

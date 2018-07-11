<template>
    <div>
        <el-row :gutter="20">   
                        <el-select v-model="shopname" 
                        filterable auto-complete clearable>
                            <el-option
                                v-for="shop in allShops"
                                :key="shop"
                                :label="shop"
                                :value="shop">
                            </el-option>
                        </el-select>
            </el-row>
            <el-row :gutter="20">
                <el-select v-model="cardname" placeholder="Card Filter"
          filterable auto-complete clearable>
          <el-option
            v-for="card in allCards"
            :key="card"
            :label="card"
            :value="card">
          </el-option>
        </el-select>
            
            <el-col :span="6">            
                <el-input v-model="minPrice"
                size="small"
                label="Mínimo" >
                </el-input>
            </el-col><el-col :span="6">
                <el-input v-model="maxPrice"
                size="small"
                label="Máximo" ></el-input>           
            </el-col>    </el-row>                      
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

    get allShops(){
        console.log(this.$store.state.shops);
        return _.map(this.$store.state.shops, s => s.name);
    }

    get cardname() {
        return this.$store.state.filters.cardname;
    }

    set cardname(name: string){
        this.$store.mutations.setCardnameFilter(name)
    }

    get shopname() {
        return this.$store.state.filters.shopname;
    }

    set shopname(name: string){
        this.$store.mutations.setShopnameFilter(name)
    }

    get minPrice() {
        return this.$store.state.filters.minPrice;
    }

    set minPrice(value: number){
        this.$store.mutations.setMinPrice(value)
    }

    get maxPrice(){
        return this.$store.state.filters.maxPrice;
    }
    
    set maxPrice(value: number){
        this.$store.mutations.setMaxPrice(value)
    }
}
</script>
<template>
  <div id="app">  
    <el-card class="box-card">
  <div slot="header" class="clearfix">
    <div id="steps">
      <el-steps :active="step" finish-status="success">
        <el-step title="Wantlist"></el-step>
        <el-step title="Stores"></el-step>
        <el-step title="Card list"></el-step>
      </el-steps>
    </div>
  </div>
  <div v-if="step === 0">
      <Wantlist></Wantlist>
</div>
<div v-else-if="step === 1">  
  <div v-if="isLoadingCards">
      <Loading></Loading>
  </div>
  <div v-else>
    <StoreList></StoreList>
    </div>
  </div>    
  <div v-else-if="step === 2">
    C
</div>
</el-card>          
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Wantlist from "./Wantlist.vue";
import StoreList from "./StoreList.vue";
import Loading from "./Loading.vue";

@Component({
  components: {
    Wantlist,
    StoreList,
    Loading
  }
})
export default class App extends Vue {
  get step() {
    return this.$store.state.step;
  }

  get isLoadingCards() {
    console.log(this.$store.getters.isLoadingCards);
    return this.$store.getters.isLoadingCards;
  }
}
</script>


<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

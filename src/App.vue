<template>
  <div id="app">
    <el-container>
      <el-main>
      <div v-if="initial">
        <WantLoader></WantLoader>
      </div>
      <div v-else>
        <div v-if="isLoadingCards">
          <Loading></Loading>
        </div>
        <div v-else>
          <el-row>
            <el-col :span="4">
              <div style="max-height: 90vh;overflow-y:auto">
              <StoreList></StoreList>
              </div>
            </el-col>
            <el-col :span="6">
              <div style="max-height: 90vh;overflow-y:auto">
              <CardList></CardList>
              </div>
            </el-col>
            <el-col :span="9">
              <div style="max-height: 90vh;overflow-y:auto">
              <CartView></CartView>
              </div>
            </el-col>
            <el-col :span="5">
              <div style="max-height: 90vh;overflow-y:auto">
               <WantList></WantList>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      </el-main>
    </el-container>
  </div>
</template>
<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import WantLoader from "./WantLoader.vue";
import WantList from "./WantList.vue";
import StoreList from "./StoreList.vue";
import CardList from "./CardList.vue";
import CartView from "./CartView.vue";
import Loading from "./Loading.vue";

@Component({
  components: {
    WantLoader,
    WantList,
    StoreList,
    CardList,
    CartView,
    Loading
  }
})
export default class App extends Vue {
  get initial() {
    return this.$store.state.loadTotal == 0 && !this.isLoadingCards;
  }

  get isLoadingCards() {
    return this.$store.getters.isLoadingCards;
  }
  created() {
    this.$store.watch(state => state.lastError, this.onError);
  }

  onError(message: string) {
    if (message != "") {
      this.$message.error(message);
      this.$store.mutations.lastErrorHandled();
    }
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

import Vue from "vue";
import { install, store } from "sinai";
import root from "./root";

Vue.use(install);

const rootStore = store(root, {
  strict: true
});

declare const module: any;
if (module.hot) {
  module.hot.accept(["./root"], () => {
    const newRoot = require("./root").default;
    rootStore.hotUpdate(newRoot);
  });
}

declare module "vue/types/vue" {
  interface Vue {
    $store: typeof rootStore;
  }
}

export default rootStore;

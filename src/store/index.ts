import Vue from 'vue';
import { install, store } from 'sinai'
import root from './root'

Vue.use(install);

const rootStore = store(root, {
    strict: false,
});

declare const module: any;
if (module.hot) {
    module.hot.accept(['./root'], () => {
        const newAuth = require('./root').default;
        rootStore.hotUpdate(newAuth);
    });
}

declare module 'vue/types/vue' {
    interface Vue {
        $store: typeof rootStore
    }
}

export default rootStore; 
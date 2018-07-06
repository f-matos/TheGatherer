<template>
    <div>
        <div v-for="store in this.$store.state.stores" :key="store.name">            
             <el-button>{{ store.name }}</el-button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";

@Component
export default class StoreList extends Vue {}
</script>

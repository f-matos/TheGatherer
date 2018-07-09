<template>
    <img :src="logo" width="100px" height="30px" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class StoreLogo extends Vue {
  @Prop() logo!: string;
}
</script>

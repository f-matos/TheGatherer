<template>
  <div>
      <textarea id="wanted" rows=20 cols="40" v-model="text">
      </textarea><br/>
       <el-button type="success" @click="load">Load</el-button>
  </div>

</template>
<script lang="ts">
import { Component, Emit, Vue } from "vue-property-decorator";

@Component
export default class WantLoader extends Vue {
  accept: number = 0;
  text: string = "";

  load() {
    const wantlist: { [k: string]: number } = {};
    const lines = this.text.split("\n");
    let count = 0;
    lines.forEach(line => {
      if (line.length === 0) return;
      const match = /([0-9]*)? ?([\wÀ-ú\-,`/' ]*)$/.exec(line);
      let quantity = 1;
      if (match != null) {
        if (match[1] != undefined) {
          quantity = parseInt(match[1]);
        }
        wantlist[match[2].trim()] = quantity;
        count += 1;
      } else {
        this.$store.mutations.addError(`What is "${line}"?`);
      }
    });
    this.$store.actions.loadCards(wantlist, count);
  }
}
</script>

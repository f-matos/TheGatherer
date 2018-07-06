<template>
  <div id="wantlist">
      <textarea id="wanted" rows=20 cols="40" v-model="text">
      </textarea><br/>
       <el-button type="success" @click="load">Load stores</el-button>
  </div>
  
</template>
<script lang="ts">
import { Component, Emit, Vue } from "vue-property-decorator";

@Component
export default class Wantlist extends Vue {
  accept: number = 0;
  text: string = "";

  load() {
    const names: Array<string> = [];
    const lines = this.text.split("\n");
    lines.forEach(line => {
      if (line.length === 0) return;
      const match = /([0-9]* )?([\wÀ-ú ]*)$/.exec(line);      
      if (match != null && match[2] != "") {
        names.push(match[2].trim());
      } else {
        this.$store.actions.addError(`What is "${line}"?`);
      }
    });
    this.$store.actions.updateCards(names);
  }

  get error() {
    return this.$message.error(this.$store.state.lastError);
  }
}
</script>
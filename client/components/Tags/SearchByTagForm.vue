<script setup lang="ts">
import { ref } from "vue";

const author = ref("");
const emit = defineEmits(["getPostsByTag"]);
</script>

<template>
  <form @submit.prevent="emit('getPostsByTag', author)" class="pure-form">
    <fieldset>
      <legend>Search by Tag</legend>
      <input id="author" type="text" v-model="author" placeholder="Tag name" />
      <button type="submit" class="pure-button pure-button-primary">Search</button>
    </fieldset>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
</style>

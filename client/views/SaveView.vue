<script setup lang="ts">
import SavedPostListComponent from "@/components/Savour/SavedPostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Saved Posts</h1>
    <section>
      <h1 v-if="isLoggedIn">Hello {{ currentUsername }}, see your saved posts below!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <SavedPostListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>

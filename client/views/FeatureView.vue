<script setup lang="ts">
import FeaturedPostListComponent from "@/components/Feature/FeaturedPostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Featured Posts</h1>
    <section>
      <h2 v-if="isLoggedIn">Hello {{ currentUsername }}, see featured posts below!</h2>
    </section>
    <FeaturedPostListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
h2 {
  text-align: center;
}
</style>

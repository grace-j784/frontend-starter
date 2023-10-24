<script setup lang="ts">
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let tags = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");

async function getTags(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let tagResults;
  try {
    tagResults = await fetchy("/api/tags", "GET", { query });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  tags.value = tagResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getTags();
  loaded.value = true;
});
</script>

<template>
  <div class="row">
    <h2>Tags:</h2>
    <SearchPostForm @getPostsByAuthor="getTags" />
  </div>
  <section class="posts" v-if="loaded && tags.length !== 0">
    <article v-for="tag in tags" :key="tag._id">
      <PostComponent v-if="editing !== tag._id" :tag="tag" @refreshPosts="getTags" @editPost="updateEditing" />
      <EditPostForm v-else :tag="tag" @refreshPosts="getTags" @editPost="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>

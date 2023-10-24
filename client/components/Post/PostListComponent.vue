<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import AddTagForm from "@/components/Tags/AddTagForm.vue";
import SearchByTagForm from "@/components/Tags/SearchByTagForm.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchPostForm from "./SearchPostForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let tagging = ref("");
let searchAuthor = ref("");
let searchTag = ref("");

async function getPosts(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  posts.value = postResults;
}

async function getTaggedPosts(tag_name?: string) {
  let query: Record<string, string>;
  if (tag_name == undefined) {
    query = {};
  } else if (tag_name == "") {
    query = { tag_name: "all" };
  } else {
    query = { tag_name: tag_name };
  }
  let postResults;
  try {
    postResults = await fetchy("/api/tags/tagged", "GET", { query });
  } catch (_) {
    return;
  }
  searchTag.value = tag_name ? tag_name : "all";
  posts.value = postResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

function updateTagging(id: string) {
  tagging.value = id;
}

async function savePost(id: string) {
  //let query: Record<string, string> = {};
  try {
    await fetchy(`/api/saves/:id`, "POST", { body: { post_id: id } });
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  await getPosts();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <h2>Create a post:</h2>
    <CreatePostForm @refreshPosts="getPosts" />
  </section>
  <div class="row">
    <h2 v-if="!searchAuthor && !searchTag">Posts:</h2>
    <h2 v-else-if="searchTag">Posts tagged {{ searchTag }}:</h2>
    <h2 v-else>Posts by {{ searchAuthor }}:</h2>
    <SearchPostForm @getPostsByAuthor="getPosts" />
    <SearchByTagForm @getPostsByTag="getTaggedPosts" />
  </div>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
      <EditPostForm v-else :post="post" @refreshPosts="getPosts" @editPost="updateEditing" @savePost="savePost" />
      <menu v-if="isLoggedIn && tagging !== post._id">
        <button class="btn-small pure-button" @click="savePost(post._id)">Save</button>
        <button class="btn-small pure-button" @click="updateTagging(post._id)">Add Tag</button>
      </menu>
      <AddTagForm v-else :post="post" @refreshPosts="getPosts" @addTag="updateTagging" />
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

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}
</style>

<script setup lang="ts">
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import EditSaveNotesForm from "@/components/Savour/EditSaveNotesForm.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let post_tags = ref<Array<Record<string, string>>>([]);
let show_tags_post_id = ref("");
let post_notes = ref("");
let show_notes_post_id = ref("");
let editing = ref("");
let editing_notes = ref("");
//let tagging = ref("");
//let deleting_tag = ref("");
let searchAuthor = ref("");
//let searchTag = ref("");

async function getSavedPosts(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/saves", "GET", { query });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  posts.value = postResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

function updateEditingNotes(id: string) {
  editing_notes.value = id;
}

async function seeTags(post_id: string) {
  let query: Record<string, string> = { post_id: post_id };
  let postResults;
  try {
    postResults = await fetchy("/api/tags/tagged/:post", "GET", { query });
  } catch (_) {
    return;
  }
  show_tags_post_id.value = post_id;
  post_tags.value = postResults;
}

async function seeNotes(post_id: string) {
  let query: Record<string, string> = { post_id: post_id };
  let postResults;
  try {
    postResults = await fetchy(`/api/saves/notes/${post_id}`, "GET", { query });
  } catch (_) {
    return;
  }
  show_notes_post_id.value = post_id;
  post_notes.value = postResults.notes;
  if (post_notes.value == undefined) {
    post_notes.value = "";
  }
}

onBeforeMount(async () => {
  await getSavedPosts();
  loaded.value = true;
});

async function UnsavePost(id: string) {
  //let query: Record<string, string> = {};
  try {
    await fetchy(`/api/saves/${id}`, "DELETE");
  } catch (_) {
    return;
  }
  await getSavedPosts();
}
</script>

<template>
  <div class="row">
    <h2 v-if="isLoggedIn">{{ currentUsername }}'s Saved Posts:</h2>
    <h2 v-else>Please login!</h2>
  </div>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="getSavedPosts" @editPost="updateEditing" />
      <EditPostForm v-else :post="post" @refreshPosts="getSavedPosts" @editPost="updateEditing" />
      <div v-if="editing_notes !== post._id">
        <menu>
          <button class="btn-small pure-button" @click="updateEditingNotes(post._id)">Edit Notes</button>
          <button class="btn-small pure-button" @click="seeNotes(post._id)">Show Notes</button>
        </menu>
        <article v-if="show_notes_post_id == post._id && post_notes.length == 0">No notes yet</article>
        <article v-else-if="show_notes_post_id == post._id">Notes: {{ post_notes }}</article>
      </div>
      <EditSaveNotesForm v-else :post="post" @refreshPosts="getSavedPosts" @editNotes="updateEditingNotes" />
      <button class="btn-small pure-button" @click="seeTags(post._id)">See Tags</button>
      <menu v-if="show_tags_post_id == post._id">
        <article v-for="tag in post_tags" :key="tag._id">{{ tag.tag_name }}</article>
        <article v-if="post_tags.length == 0">Post has no tags</article>
      </menu>
      <button class="btn-small pure-button" @refreshPosts="getSavedPosts" @click="UnsavePost(post._id)">Unsave</button>
    </article>
  </section>
  <p v-else-if="loaded">No posts found or user not logged in</p>
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
  align-tracks: left;
}
</style>

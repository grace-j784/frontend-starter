<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import { formatDate } from "../../utils/formatDate";

const props = defineProps(["post"]);
let content = ref("");
const emit = defineEmits(["editNotes", "refreshPosts"]);

const getNotes = async () => {
  let query: Record<string, string> = { post_id: props.post._id };
  let postResults;
  try {
    postResults = await fetchy(`/api/saves/notes/${props.post._id}`, "GET", { query });
  } catch (_) {
    return;
  }
  content.value = postResults.notes;
  if (content.value == undefined) {
    content.value = "";
  }
};

onBeforeMount(async () => {
  await getNotes();
});

const editNotes = async (content: string) => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "PATCH", { body: { update: { content: content } } });
  } catch (e) {
    // TODO!
    return;
  }
  emit("editNotes");
  emit("refreshPosts");
};
</script>

<template>
  <form @submit.prevent="editNotes(content)">
    <p class="author">{{ props.post.author }}</p>
    <textarea id="content" v-model="content" placeholder="Add notes!" required> </textarea>
    <div class="base">
      <menu>
        <li><button class="btn-small pure-button-primary pure-button" type="submit">Save</button></li>
        <li><button class="btn-small pure-button" @click="emit('editNotes')">Cancel</button></li>
      </menu>
      <p v-if="props.post.dateCreated !== props.post.dateUpdated" class="timestamp">Edited on: {{ formatDate(props.post.dateUpdated) }}</p>
      <p v-else class="timestamp">Created on: {{ formatDate(props.post.dateCreated) }}</p>
    </div>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  border-radius: 4px;
  resize: none;
}

p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}
</style>

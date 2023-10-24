<script setup lang="ts">
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const content = "";
const emit = defineEmits(["deleteTag", "refreshPosts"]);

const deleteTag = async (tag_name: string) => {
  try {
    await fetchy(`/api/tags/${props.post._id}/${tag_name}`, "DELETE");
  } catch (e) {
    return;
  }
  emit("deleteTag");
  emit("refreshPosts");
};
</script>

<template>
  <form @submit.prevent="deleteTag(content)">
    <textarea id="content" v-model="content" placeholder="Name of tag to remove" required> </textarea>
    <div class="base">
      <menu>
        <li><button class="btn-small pure-button-primary pure-button" type="submit">Remove</button></li>
        <li><button class="btn-small pure-button" @click="emit('deleteTag')">Cancel</button></li>
      </menu>
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

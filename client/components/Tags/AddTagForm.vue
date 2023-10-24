<script setup lang="ts">
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const content = "";
const emit = defineEmits(["addTag", "refreshPosts"]);

const addTag = async (tag_name: string) => {
  try {
    await fetchy(`/api/tags/${props.post._id}`, "POST", { body: { make_public: "no", post_id: props.post._id, tag_name: tag_name } });
  } catch (e) {
    return;
  }
  emit("addTag");
  emit("refreshPosts");
};
</script>

<template>
  <form @submit.prevent="addTag(content)">
    <textarea id="content" v-model="content" placeholder="Write tag name here!" required> </textarea>
    <div class="base">
      <menu>
        <li><button class="btn-small pure-button-primary pure-button" type="submit">Save</button></li>
        <li><button class="btn-small pure-button" @click="emit('addTag')">Cancel</button></li>
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

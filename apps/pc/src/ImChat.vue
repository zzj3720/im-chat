<template>
  <div v-if="hasRootChat" flex w-screen h-screen>
    <div w="50%">
      <RootView v-if="isRoot"></RootView>
      <BeforeView v-else></BeforeView>
    </div>
    <AfterView w="50%"></AfterView>
  </div>
  <div v-else flex w-screen h-screen>
    <AfterView flex-1></AfterView>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import RootView from "./components/historyPanel/HistoryPanel.vue";
import BeforeView from "./components/PromptView.vue";
import AfterView from "./components/chat/ChatView.vue";
import { injectTreeChat } from "chat-logic";

const chat = injectTreeChat();
const isRoot = computed(() => {
  return chat.current.value == null;
});
const hasRootChat = computed(() => {
  return chat.historyList.value.length > 0;
});
</script>

<style scoped></style>

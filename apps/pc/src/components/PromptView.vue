<template>
  <div h-full flex flex-col class="primary-bg">
    <div shrink-0 p-2 flex items-center justify-between>
      <n-button round size="tiny" @click="back">
        <template #icon>
          <div class="i-material-symbols-arrow-back-rounded"></div>
        </template>
        返回
      </n-button>
      <div font-bold>Prompt</div>
      <div></div>
    </div>
    <div flex-1 overflow-y-scroll overflow-x-hidden p-2>
      <div p-2 bg-white rd-2 shadow>
        <message-view
          :class="[i != 0 && 'mt-2']"
          v-for="(msg, i) in beforeList"
          :key="msg.id"
          :message="msg"
        ></message-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { injectTreeChat } from "chat-logic";
import { computed } from "vue";
import MessageView from "./message/MessageView.vue";

const chat = injectTreeChat();
const beforeList = computed(() => {
  if (chat.current.value) {
    return chat.getBeforeChat(chat.current.value);
  }
});
const back = () => {
  chat.current.value = undefined;
};
</script>

<style scoped></style>

import { inject, provide, reactive, Ref, ref } from "vue";
import { nanoid } from "nanoid";
import { GlobalConfig, useConfig } from "../utils/config";
import { askGPT, GPTModel, Message, UserRole } from "../utils/chatApi";
import { useStorageAsync } from "@vueuse/core";

type GPTInfo = {
  model: GPTModel;
  temperature: number;
  totalTime?: number;
};
export type MessageNode = {
  id: string;
  isNew: boolean;
  shareId?: string;
  parent?: string;
  children: string[];
  message: Message;
  abort?: AbortController;
  gptInfo?: GPTInfo;
  workModel: boolean;
  setting: {
    model: GPTModel;
    temperature: number;
  };
};
export type TreeChat = Record<string, MessageNode>;
export type Chat = MessageNode[];
export type ChatList = Chat[];

export const provideTreeChat = () => {
  const chat = useTreeChat();
  provide("treeChat", chat);
  return chat;
};
export const injectTreeChat = () => {
  return inject("treeChat") as ReturnType<typeof provideTreeChat>;
};
const useTreeChat = () => {
  const current = ref<string>();
  const roots = useStorageAsync<string[]>("treeRoots", [], localStorage, {
    deep: true,
  });
  const treeChat = useStorageAsync<TreeChat>("treeChat", {}, localStorage, {
    deep: true,
  });
  const config: Ref<GlobalConfig> = useConfig();
  const newMessage = (
    role: UserRole,
    message: string,
    ops?: {
      parent?: string;
      loading?: boolean;
    }
  ): MessageNode => {
    const id = nanoid();
    const parent = ops?.parent != null ? treeChat.value[ops.parent] : undefined;
    const node: MessageNode = reactive({
      id,
      isNew: true,
      children: [],
      workModel: true,
      message: {
        role,
        content: message,
      },
      parent: ops?.parent,
      setting: parent
        ? { ...parent.setting }
        : {
            model: config.value.model,
            temperature: config.value.temperature,
          },
    });
    if (parent) {
      parent.children.push(id);
    } else {
      roots.value.unshift(id);
    }
    treeChat.value[id] = node;
    return node;
  };
  const getBeforeChat = (id: string): MessageNode[] => {
    const messages: MessageNode[] = [];
    let node: MessageNode | undefined = treeChat.value[id];
    while (node) {
      messages.push(node);
      node = node.parent ? treeChat.value[node.parent] : undefined;
    }
    return messages.reverse();
  };
  const getAnswer = (id: string, setting?: GPTInfo): MessageNode => {
    const messageNode = newMessage("assistant", "", {
      parent: id,
    });
    messageNode.abort = new AbortController();
    const genInfo: GPTInfo = reactive(
      setting
        ? setting
        : {
            model: config.value.model,
            temperature: config.value.temperature,
          }
    );
    messageNode.gptInfo = genInfo;
    const totalTime = Date.now();
    askGPT(
      getBeforeChat(id).map((v) => v.message),
      {
        model: genInfo.model,
        temperature: genInfo.temperature,
        apiKey: config.value.apiKey,
      },
      {
        signal: messageNode.abort.signal,
        onMessage: (msg) => {
          messageNode.message.content += msg;
        },
        onFinished() {
          messageNode.abort = undefined;
          genInfo.totalTime = Date.now() - totalTime;
        },
        onError(err) {
          console.error(err);
        },
      }
    );
    return messageNode;
  };

  const getAfterChatList = (id?: string): ChatList => {
    const ids = id == null ? roots.value : treeChat.value[id].children;
    const getList = (id: string): Chat => {
      const list: Chat = [];
      let node: MessageNode | undefined = treeChat.value[id];
      while (node) {
        list.push(node);
        node =
          node.children.length === 1
            ? treeChat.value[node.children[0]]
            : undefined;
      }
      return list;
    };
    return ids.map(getList);
  };
  const findFirstForkedNode = (id: string): string | undefined => {
    let node: MessageNode | undefined = treeChat.value[id];
    while (node) {
      if (node.children.length === 1) {
        node = treeChat.value[node.children[0]];
      } else {
        return node.id;
      }
    }
  };
  const getCurrentMessage = () => {
    if (!current.value) {
      return;
    }
    return treeChat.value[current.value];
  };
  const deleteMessage = (id: string) => {
    const node = treeChat.value[id];
    if (node.parent) {
      const parent = treeChat.value[node.parent];
      parent.children = parent.children.filter((v) => v !== id);
    } else {
      roots.value = roots.value.filter((v) => v !== id);
    }
    const deleteChildren = (id: string) => {
      const node = treeChat.value[id];
      node.children.forEach(deleteChildren);
      delete treeChat.value[id];
    };
    deleteChildren(id);
  };
  const getSetting = (id: string) => {
    const node = treeChat.value[id];
    return node.setting;
  };
  return {
    newMessage,
    getAnswer,
    getAfterChatList,
    getBeforeChat,
    current,
    findFirstForkedNode,
    getCurrentMessage,
    config,
    deleteMessage,
    getSetting,
    isExist(id: string) {
      return !!treeChat.value[id];
    },
    load(data: MessageNode[]) {
      data.forEach((msg) => {
        treeChat.value[msg.id] = msg;
      });
    },
  };
};

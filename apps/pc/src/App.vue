<script lang="ts" setup>
import {
  GlobalThemeOverrides,
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  NNotificationProvider,
} from "naive-ui";
import { provideTreeChat } from "chat-logic";

const chat = provideTreeChat();
const themeOverrides: GlobalThemeOverrides = {
  common: {
    fontSize: "12px",
    fontSizeSmall: "12px",
    baseColor: "#FFF",
    primaryColor: "#292929FF",
    primaryColorHover: "#525252FF",
    infoColor: "#A3A3A3FF",
    primaryColorPressed: "#292929FF",
    primaryColorSuppl: "#292929FF",
    infoColorHover: "#CCCCCCFF",
    infoColorPressed: "#A3A3A3FF",
    infoColorSuppl: "#A3A3A3FF",
    placeholderColor: "rgb(190,184,184)",
    successColor: "#00E86DFF",
    successColorHover: "#47FF9DFF",
    successColorPressed: "#00E86DFF",
    successColorSuppl: "#00E86DFF",
    warningColor: "#FFBC51FF",
    warningColorHover: "#FFD797FF",
    warningColorPressed: "#FFBC51FF",
    warningColorSuppl: "#FFBC51FF",
    errorColor: "#FF484BFF",
    errorColorHover: "#FF9193FF",
    errorColorPressed: "#FF484BFF",
    errorColorSuppl: "#FF484BFF",
  },
  Tooltip: {
    padding: "2px 6px",
  },
  Spin: {
    sizeTiny: "10px",
    sizeSmall: "12px",
    sizeMedium: "14px",
    sizeLarge: "18px",
  },
  Input: {
    border: "1px solid #525252",
  },
} as GlobalThemeOverrides;
</script>
<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <router-view></router-view>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
<style>
div {
  box-sizing: border-box;
}
</style>

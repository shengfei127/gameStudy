<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useAppStore } from "@/stores/app";

onLaunch(() => {
  const appStore = useAppStore();
  const systemInfo = uni.getSystemInfoSync();

  appStore.hydrate();
  appStore.recordLaunch(systemInfo.platform || "unknown");
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style>
page {
  min-height: 100%;
  background: #f4f7fb;
  color: #1f2937;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

view,
text,
button,
input,
textarea {
  box-sizing: border-box;
}

button {
  margin: 0;
}
</style>

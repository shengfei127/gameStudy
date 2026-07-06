<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { usePetStore } from "@/stores/pet";

onLaunch(() => {
  const petStore = usePetStore();
  petStore.hydrate();
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
  background: #f2f6f3;
  color: #203047;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

view,
text,
button,
input,
textarea,
picker {
  box-sizing: border-box;
}

button {
  margin: 0;
}
</style>

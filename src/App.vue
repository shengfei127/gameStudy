<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useAuthStore } from "@/stores/auth";
import { usePetStore } from "@/stores/pet";

onLaunch(() => {
  void bootApp();
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});

async function bootApp() {
  const authStore = useAuthStore();
  const petStore = usePetStore();
  const session = await authStore.hydrate();

  if (session) {
    await petStore.hydrate();
    redirectAfterBoot("/pages/home/index", true);
    return;
  }

  petStore.clearState();
  redirectAfterBoot("/pages/auth/index", false);
}

function redirectAfterBoot(url: string, tabPage: boolean) {
  setTimeout(() => {
    const pages = getCurrentPages();
    const currentRoute = pages[pages.length - 1]?.route || "";

    if (`/${currentRoute}` === url || currentRoute === url.replace(/^\//, "")) {
      return;
    }

    if (tabPage) {
      uni.switchTab({ url });
      return;
    }

    uni.reLaunch({ url });
  }, 0);
}
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

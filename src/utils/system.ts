import type { InfoItem } from "@/types/app";

export function getDeviceInfo(): InfoItem[] {
  const systemInfo = uni.getSystemInfoSync();

  return [
    {
      label: "Platform",
      value: systemInfo.platform || "unknown",
    },
    {
      label: "System",
      value: systemInfo.system || "unknown",
    },
    {
      label: "Model",
      value: systemInfo.model || "unknown",
    },
    {
      label: "Window",
      value: `${systemInfo.windowWidth || 0} x ${systemInfo.windowHeight || 0}`,
    },
  ];
}

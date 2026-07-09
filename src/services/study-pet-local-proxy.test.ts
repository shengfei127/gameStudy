import { describe, expect, test, vi } from "vitest";
import { createReloadingCloudFunctionInvoker, type CloudFunctionEvent } from "../../vite.config";

describe("study-pet local proxy loader", () => {
  test("reloads the cloud function when its source version changes", async () => {
    let sourceVersion = 1;
    let loadedLabel = "old-shop-items";
    const load = vi.fn(() => {
      const label = loadedLabel;
      return async (event: CloudFunctionEvent) => ({
        success: true,
        data: `${label}:${event.payload?.itemId}`,
      });
    });
    const invoke = createReloadingCloudFunctionInvoker({
      getVersion: () => sourceVersion,
      load,
    });

    await expect(invoke({ action: "buyShopItem", payload: { itemId: "violet_quill" } })).resolves.toMatchObject({
      data: "old-shop-items:violet_quill",
    });

    loadedLabel = "new-shop-items";
    await expect(invoke({ action: "buyShopItem", payload: { itemId: "violet_quill" } })).resolves.toMatchObject({
      data: "old-shop-items:violet_quill",
    });

    sourceVersion = 2;
    await expect(invoke({ action: "buyShopItem", payload: { itemId: "violet_quill" } })).resolves.toMatchObject({
      data: "new-shop-items:violet_quill",
    });
    expect(load).toHaveBeenCalledTimes(2);
  });
});

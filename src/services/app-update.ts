import { appConfig } from "@/config";

export type AppUpdatePlatform = "android" | "ios" | "app-plus" | "h5" | string;

export interface CurrentAppVersion {
  versionName: string;
  versionCode: number;
  platform: AppUpdatePlatform;
}

export interface AppUpdateManifest {
  versionName?: string;
  version?: string;
  versionCode?: number | string;
  platforms?: AppUpdatePlatform[];
  platform?: AppUpdatePlatform | AppUpdatePlatform[];
  downloadUrl?: string;
  apkUrl?: string;
  wgtUrl?: string;
  changelog?: string | string[];
  notes?: string | string[];
  force?: boolean;
  mandatory?: boolean;
  title?: string;
}

export interface AvailableAppUpdate {
  versionName: string;
  versionCode: number;
  downloadUrl: string;
  notes: string[];
  force: boolean;
  title: string;
}

export type AppUpdateResult =
  | { status: "available"; update: AvailableAppUpdate }
  | { status: "up-to-date" }
  | { status: "not-configured" }
  | { status: "unsupported-platform" };

export interface CheckAppUpdateOptions {
  current?: CurrentAppVersion;
  manifestUrl?: string;
  request?: (url: string) => Promise<AppUpdateManifest>;
}

export const APP_UPDATE_MANIFEST_URL = appConfig.updateManifestUrl;

export async function checkAppUpdate(options: CheckAppUpdateOptions = {}): Promise<AppUpdateResult> {
  const manifestUrl = options.manifestUrl ?? APP_UPDATE_MANIFEST_URL;

  if (!manifestUrl) {
    return { status: "not-configured" };
  }

  const requestManifest = options.request || requestAppUpdateManifest;
  const manifest = await requestManifest(manifestUrl);

  return resolveAppUpdate(options.current || getCurrentAppVersion(), manifest);
}

export function resolveAppUpdate(current: CurrentAppVersion, manifest: AppUpdateManifest): AppUpdateResult {
  if (!supportsPlatform(current.platform, manifest)) {
    return { status: "unsupported-platform" };
  }

  const versionName = manifest.versionName || manifest.version || "";
  const versionCode = normalizeVersionCode(manifest.versionCode);
  const downloadUrl = manifest.downloadUrl || manifest.apkUrl || manifest.wgtUrl || "";
  const hasNewerCode = versionCode > 0 && versionCode > current.versionCode;
  const hasNewerName = !hasNewerCode && Boolean(versionName) && compareVersionName(versionName, current.versionName) > 0;

  if (!downloadUrl || (!hasNewerCode && !hasNewerName)) {
    return { status: "up-to-date" };
  }

  return {
    status: "available",
    update: {
      versionName: versionName || String(versionCode),
      versionCode,
      downloadUrl,
      notes: normalizeNotes(manifest.changelog ?? manifest.notes),
      force: Boolean(manifest.force || manifest.mandatory),
      title: manifest.title || `发现新版本 ${versionName || versionCode}`,
    },
  };
}

export function compareVersionName(nextVersion: string, currentVersion: string) {
  const nextParts = parseVersionParts(nextVersion);
  const currentParts = parseVersionParts(currentVersion);
  const maxLength = Math.max(nextParts.length, currentParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const next = nextParts[index] || 0;
    const current = currentParts[index] || 0;

    if (next !== current) {
      return next - current;
    }
  }

  return 0;
}

export function getCurrentAppVersion(): CurrentAppVersion {
  const systemInfo = uni.getSystemInfoSync();
  const runtime = getPlusRuntime();

  return {
    versionName: runtime?.version || appConfig.version,
    versionCode: normalizeVersionCode(runtime?.versionCode) || appConfig.versionCode,
    platform: systemInfo.platform || "unknown",
  };
}

export function downloadAndInstallUpdate(update: AvailableAppUpdate) {
  const runtime = getPlusRuntime();

  if (!runtime) {
    return Promise.reject(new Error("当前环境不支持 App 安装，请在 Android App 内检查更新"));
  }

  return downloadUpdatePackage(update.downloadUrl).then(
    (filePath) =>
      new Promise<void>((resolve, reject) => {
        runtime.install(
          filePath,
          { force: update.force },
          () => resolve(),
          (error) => reject(new Error(getRuntimeErrorMessage(error) || "安装更新失败")),
        );
      }),
  );
}

function requestAppUpdateManifest(url: string) {
  return new Promise<AppUpdateManifest>((resolve, reject) => {
    uni.request({
      url,
      method: "GET",
      success(response) {
        const statusCode = response.statusCode || 0;

        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(`检查更新失败：${statusCode}`));
          return;
        }

        resolve(response.data as AppUpdateManifest);
      },
      fail(error) {
        reject(error);
      },
    });
  });
}

function downloadUpdatePackage(url: string) {
  return new Promise<string>((resolve, reject) => {
    uni.downloadFile({
      url,
      success(result) {
        if (result.statusCode >= 200 && result.statusCode < 300 && result.tempFilePath) {
          resolve(result.tempFilePath);
          return;
        }

        reject(new Error(`下载安装包失败：${result.statusCode || "unknown"}`));
      },
      fail(error) {
        reject(error);
      },
    });
  });
}

function supportsPlatform(currentPlatform: AppUpdatePlatform, manifest: AppUpdateManifest) {
  const rawPlatforms = manifest.platforms || manifest.platform;
  const platforms = Array.isArray(rawPlatforms) ? rawPlatforms : rawPlatforms ? [rawPlatforms] : [];

  if (platforms.length === 0) {
    return true;
  }

  return platforms.some((platform) => platform === currentPlatform || platform === "app-plus");
}

function normalizeNotes(value: AppUpdateManifest["changelog"] | AppUpdateManifest["notes"]) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeVersionCode(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function parseVersionParts(version: string) {
  return version
    .split(/[.-]/)
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));
}

function getPlusRuntime(): PlusRuntime | null {
  return typeof plus === "undefined" ? null : plus.runtime;
}

function getRuntimeErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const candidate = error as { message?: string; code?: string | number };
    return candidate.message || (candidate.code ? `错误码 ${candidate.code}` : "");
  }

  return typeof error === "string" ? error : "";
}

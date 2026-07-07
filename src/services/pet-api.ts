import {
  buyShopItem as applyBuyShopItem,
  createInitialProgress,
  equipShopItem as applyEquipShopItem,
  feedPet as applyFeedPet,
  getEvolutionStage,
  normalizePetProgress,
  recordStudySession,
  type EggId,
  type EvolutionStage,
  type FeedItem,
  type PetProgress,
  type ShopItem,
  type ShopItemId,
  type StudyInput,
} from "@/domain/pet";
import { AUTH_SESSION_STORAGE_KEY, type AuthSession } from "./auth-api";

const PROGRESS_STORAGE_KEY = "study-pet-progress";
const CLIENT_ID_STORAGE_KEY = "study-pet-client-id";
const CLOUD_FUNCTION_NAME = "study-pet";
const LOCAL_PROXY_URL = "/api/study-pet";

export interface CheckInResult {
  reward: number;
  progress: PetProgress;
}

export interface FeedResult {
  item: FeedItem;
  progress: PetProgress;
  evolved: boolean;
  stage: EvolutionStage;
}

export interface ShopItemResult {
  item: ShopItem;
  progress: PetProgress;
}

export interface PetApi {
  getProgress(): Promise<PetProgress | null>;
  chooseEgg(eggId: EggId): Promise<PetProgress>;
  recordCheckIn(input: StudyInput): Promise<CheckInResult>;
  feed(itemId: FeedItem["id"]): Promise<FeedResult>;
  buyShopItem(itemId: ShopItemId): Promise<ShopItemResult>;
  equipShopItem(itemId: ShopItemId): Promise<ShopItemResult>;
  resetProgress(): Promise<PetProgress | null>;
  uploadStudyPhoto(tempFilePath: string): Promise<string>;
}

export interface StorageAdapter {
  get<T = unknown>(key: string): T | undefined;
  set(key: string, value: unknown): void;
  remove(key: string): void;
}

export interface LocalPetApiOptions {
  storage?: StorageAdapter;
  now?: () => Date;
}

interface UniCloudCallResult<T> {
  result?: CloudResponse<T>;
}

interface UniCloudUploadResult {
  fileID?: string;
}

interface UniCloudClient {
  callFunction<T>(options: { name: string; data: CloudRequest }): Promise<UniCloudCallResult<T>>;
  uploadFile(options: { filePath: string; cloudPath: string }): Promise<UniCloudUploadResult>;
}

interface CloudRequest {
  action: CloudAction;
  payload: Record<string, unknown>;
}

type CloudAction =
  | "getProgress"
  | "chooseEgg"
  | "checkIn"
  | "feed"
  | "buyShopItem"
  | "equipShopItem"
  | "resetProgress";

type CloudResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      message?: string;
    };

export function createLocalPetApi(options: LocalPetApiOptions = {}): PetApi {
  const storage = options.storage || createUniStorageAdapter();
  const now = options.now || (() => new Date());

  return {
    async getProgress() {
      return readProgress(storage);
    },

    async chooseEgg(eggId) {
      const progress = createInitialProgress(eggId);
      writeProgress(storage, progress);
      return progress;
    },

    async recordCheckIn(input) {
      const progress = requireProgress(readProgress(storage));
      const result = recordStudySession(progress, input, now());
      writeProgress(storage, result.progress);
      return result;
    },

    async feed(itemId) {
      const progress = requireProgress(readProgress(storage));
      const beforeStage = getEvolutionStage(progress.growth);
      const result = applyFeedPet(progress, itemId, now());
      const afterStage = getEvolutionStage(result.progress.growth);

      writeProgress(storage, result.progress);

      return {
        ...result,
        evolved: beforeStage.id !== afterStage.id,
        stage: afterStage,
      };
    },

    async buyShopItem(itemId) {
      const progress = requireProgress(readProgress(storage));
      const result = applyBuyShopItem(progress, itemId);
      writeProgress(storage, result.progress);
      return result;
    },

    async equipShopItem(itemId) {
      const progress = requireProgress(readProgress(storage));
      const result = applyEquipShopItem(progress, itemId);
      writeProgress(storage, result.progress);
      return result;
    },

    async resetProgress() {
      storage.remove(PROGRESS_STORAGE_KEY);
      return null;
    },

    async uploadStudyPhoto(tempFilePath) {
      return tempFilePath;
    },
  };
}

export function createUniCloudPetApi(options: { storage?: StorageAdapter } = {}): PetApi {
  const storage = options.storage || createUniStorageAdapter();

  return {
    getProgress() {
      return callProgressCloud(storage, "getProgress", {});
    },

    chooseEgg(eggId) {
      return callRequiredProgressCloud(storage, "chooseEgg", { eggId });
    },

    recordCheckIn(input) {
      return callCheckInCloud(storage, "checkIn", { input });
    },

    feed(itemId) {
      return callFeedCloud(storage, "feed", { itemId });
    },

    buyShopItem(itemId) {
      return callShopCloud(storage, "buyShopItem", { itemId });
    },

    equipShopItem(itemId) {
      return callShopCloud(storage, "equipShopItem", { itemId });
    },

    resetProgress() {
      return callCloud<PetProgress | null>(storage, "resetProgress", {});
    },

    async uploadStudyPhoto(tempFilePath) {
      const uniCloudClient = getUniCloudClient();
      const clientId = getClientId(storage);
      const suffix = getFileSuffix(tempFilePath);
      const cloudPath = `study-pet/${clientId}/${Date.now()}-${randomText(8)}${suffix}`;
      const result = await uniCloudClient.uploadFile({
        filePath: tempFilePath,
        cloudPath,
      });

      if (!result.fileID) {
        throw new Error("学习照片上传失败");
      }

      return result.fileID;
    },
  };
}

export function createLocalProxyPetApi(
  options: { storage?: StorageAdapter; baseUrl?: string; fetcher?: typeof fetch } = {},
): PetApi {
  const storage = options.storage || createUniStorageAdapter();
  const baseUrl = options.baseUrl || import.meta.env.VITE_STUDY_PET_PROXY_URL || LOCAL_PROXY_URL;

  return {
    getProgress() {
      return callProgressLocalProxy(storage, baseUrl, options.fetcher, "getProgress", {});
    },

    chooseEgg(eggId) {
      return callRequiredProgressLocalProxy(storage, baseUrl, options.fetcher, "chooseEgg", { eggId });
    },

    recordCheckIn(input) {
      return callCheckInLocalProxy(storage, baseUrl, options.fetcher, "checkIn", { input });
    },

    feed(itemId) {
      return callFeedLocalProxy(storage, baseUrl, options.fetcher, "feed", { itemId });
    },

    buyShopItem(itemId) {
      return callShopLocalProxy(storage, baseUrl, options.fetcher, "buyShopItem", { itemId });
    },

    equipShopItem(itemId) {
      return callShopLocalProxy(storage, baseUrl, options.fetcher, "equipShopItem", { itemId });
    },

    resetProgress() {
      return callLocalProxy<PetProgress | null>(storage, baseUrl, options.fetcher, "resetProgress", {});
    },

    async uploadStudyPhoto(tempFilePath) {
      return tempFilePath;
    },
  };
}

export function shouldUseUniCloud() {
  return import.meta.env.VITE_PROGRESS_STORAGE === "cloud" || import.meta.env.VITE_USE_UNICLOUD === "true";
}

export function shouldUseLocalProxy() {
  return import.meta.env.VITE_PROGRESS_STORAGE === "proxy" || import.meta.env.VITE_PROGRESS_STORAGE === "local-proxy";
}

export function createPetApi(): PetApi {
  if (shouldUseUniCloud()) {
    return createUniCloudPetApi();
  }

  if (shouldUseLocalProxy()) {
    return createLocalProxyPetApi();
  }

  return createLocalPetApi();
}

export const petApi: PetApi = createPetApi();

async function callCloud<T>(storage: StorageAdapter, action: CloudAction, payload: Record<string, unknown>) {
  const uniCloudClient = getUniCloudClient();
  const response = await uniCloudClient.callFunction<T>({
    name: CLOUD_FUNCTION_NAME,
    data: createCloudRequest(storage, action, payload),
  });
  const body = response.result;

  if (!body) {
    throw new Error("云端接口无响应");
  }

  if (!body.success) {
    throw new Error(body.message || "云端接口调用失败");
  }

  return body.data;
}

async function callProgressCloud(storage: StorageAdapter, action: CloudAction, payload: Record<string, unknown>) {
  return normalizeProgressResult(await callCloud<PetProgress | null>(storage, action, payload));
}

async function callRequiredProgressCloud(storage: StorageAdapter, action: CloudAction, payload: Record<string, unknown>) {
  return normalizePetProgress(await callCloud<PetProgress>(storage, action, payload));
}

async function callCheckInCloud(storage: StorageAdapter, action: CloudAction, payload: Record<string, unknown>) {
  return normalizeCheckInResult(await callCloud<CheckInResult>(storage, action, payload));
}

async function callFeedCloud(storage: StorageAdapter, action: CloudAction, payload: Record<string, unknown>) {
  return normalizeFeedResult(await callCloud<FeedResult>(storage, action, payload));
}

async function callShopCloud(storage: StorageAdapter, action: CloudAction, payload: Record<string, unknown>) {
  return normalizeShopResult(await callCloud<ShopItemResult>(storage, action, payload));
}

async function callLocalProxy<T>(
  storage: StorageAdapter,
  baseUrl: string,
  fetcher: typeof fetch | undefined,
  action: CloudAction,
  payload: Record<string, unknown>,
) {
  const request = createCloudRequest(storage, action, payload);
  const runFetch = fetcher || globalThis.fetch;

  if (!runFetch) {
    throw new Error("当前环境不支持本地调试代理请求");
  }

  const response = await runFetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`本地调试代理调用失败（${response.status}）`);
  }

  const body = (await response.json()) as CloudResponse<T>;

  if (!body.success) {
    throw new Error(body.message || "本地调试代理调用失败");
  }

  return body.data;
}

async function callProgressLocalProxy(
  storage: StorageAdapter,
  baseUrl: string,
  fetcher: typeof fetch | undefined,
  action: CloudAction,
  payload: Record<string, unknown>,
) {
  return normalizeProgressResult(await callLocalProxy<PetProgress | null>(storage, baseUrl, fetcher, action, payload));
}

async function callRequiredProgressLocalProxy(
  storage: StorageAdapter,
  baseUrl: string,
  fetcher: typeof fetch | undefined,
  action: CloudAction,
  payload: Record<string, unknown>,
) {
  return normalizePetProgress(await callLocalProxy<PetProgress>(storage, baseUrl, fetcher, action, payload));
}

async function callCheckInLocalProxy(
  storage: StorageAdapter,
  baseUrl: string,
  fetcher: typeof fetch | undefined,
  action: CloudAction,
  payload: Record<string, unknown>,
) {
  return normalizeCheckInResult(await callLocalProxy<CheckInResult>(storage, baseUrl, fetcher, action, payload));
}

async function callFeedLocalProxy(
  storage: StorageAdapter,
  baseUrl: string,
  fetcher: typeof fetch | undefined,
  action: CloudAction,
  payload: Record<string, unknown>,
) {
  return normalizeFeedResult(await callLocalProxy<FeedResult>(storage, baseUrl, fetcher, action, payload));
}

async function callShopLocalProxy(
  storage: StorageAdapter,
  baseUrl: string,
  fetcher: typeof fetch | undefined,
  action: CloudAction,
  payload: Record<string, unknown>,
) {
  return normalizeShopResult(await callLocalProxy<ShopItemResult>(storage, baseUrl, fetcher, action, payload));
}

function normalizeProgressResult(progress: PetProgress | null) {
  return progress ? normalizePetProgress(progress) : null;
}

function normalizeCheckInResult(result: CheckInResult) {
  return {
    ...result,
    progress: normalizePetProgress(result.progress),
  };
}

function normalizeFeedResult(result: FeedResult) {
  return {
    ...result,
    progress: normalizePetProgress(result.progress),
  };
}

function normalizeShopResult(result: ShopItemResult) {
  return {
    ...result,
    progress: normalizePetProgress(result.progress),
  };
}

function createCloudRequest(storage: StorageAdapter, action: CloudAction, payload: Record<string, unknown>) {
  return {
    action,
    payload: createIdentityPayload(storage, payload),
  };
}

function createIdentityPayload(storage: StorageAdapter, payload: Record<string, unknown>) {
  const session = storage.get<AuthSession | null | "">(AUTH_SESSION_STORAGE_KEY);

  if (session && typeof session === "object" && typeof session.token === "string" && session.token) {
    return {
      ...payload,
      authToken: session.token,
    };
  }

  return {
    ...payload,
    clientId: getClientId(storage),
  };
}

function readProgress(storage: StorageAdapter) {
  const value = storage.get<PetProgress | null | "">(PROGRESS_STORAGE_KEY);

  if (value && typeof value === "object") {
    return normalizePetProgress(value);
  }

  return null;
}

function writeProgress(storage: StorageAdapter, progress: PetProgress) {
  storage.set(PROGRESS_STORAGE_KEY, progress);
}

function requireProgress(progress: PetProgress | null) {
  if (!progress) {
    throw new Error("请先选择一颗宠物蛋");
  }

  return progress;
}

function createUniStorageAdapter(): StorageAdapter {
  return {
    get(key) {
      const value = uni.getStorageSync(key);
      return value === "" ? undefined : value;
    },
    set(key, value) {
      uni.setStorageSync(key, value);
    },
    remove(key) {
      uni.removeStorageSync(key);
    },
  };
}

function getClientId(storage: StorageAdapter) {
  const cached = storage.get<string>(CLIENT_ID_STORAGE_KEY);

  if (cached) {
    return cached;
  }

  const clientId = `anon-${Date.now()}-${randomText(12)}`;
  storage.set(CLIENT_ID_STORAGE_KEY, clientId);
  return clientId;
}

function getUniCloudClient() {
  const uniCloudClient = (globalThis as unknown as { uniCloud?: UniCloudClient }).uniCloud;

  if (!uniCloudClient) {
    throw new Error("未检测到 uniCloud，请先绑定云服务空间");
  }

  return uniCloudClient;
}

function getFileSuffix(filePath: string) {
  const cleanPath = filePath.split("?")[0];
  const match = cleanPath.match(/\.[a-z0-9]+$/i);
  return match ? match[0].toLowerCase() : ".jpg";
}

function randomText(length: number) {
  return Math.random().toString(36).slice(2, 2 + length).padEnd(length, "0");
}

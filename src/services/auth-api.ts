import type { StorageAdapter } from "./pet-api";

export const AUTH_SESSION_STORAGE_KEY = "study-pet-auth-session";
const LOCAL_PROXY_URL = "/api/study-pet";
const CLOUD_FUNCTION_NAME = "study-pet";

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  username: string;
}

export interface AuthApi {
  register(credentials: AuthCredentials): Promise<AuthSession>;
  login(credentials: AuthCredentials): Promise<AuthSession>;
  getSession(token: string): Promise<AuthSession>;
  logout(token: string): Promise<null>;
  getCachedSession(): Promise<AuthSession | null>;
  saveSession(session: AuthSession): Promise<void>;
  clearSession(): Promise<void>;
}

interface CloudRequest {
  action: AuthAction;
  payload: Record<string, unknown>;
}

type AuthAction = "register" | "login" | "getSession" | "logout";

type CloudResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      message?: string;
    };

interface UniCloudCallResult<T> {
  result?: CloudResponse<T>;
}

interface UniCloudClient {
  callFunction<T>(options: { name: string; data: CloudRequest }): Promise<UniCloudCallResult<T>>;
}

export function createLocalProxyAuthApi(
  options: { storage?: StorageAdapter; baseUrl?: string; fetcher?: typeof fetch } = {},
): AuthApi {
  const storage = options.storage || createUniStorageAdapter();
  const baseUrl = options.baseUrl || import.meta.env.VITE_STUDY_PET_PROXY_URL || LOCAL_PROXY_URL;

  return buildAuthApi({
    storage,
    request(action, payload) {
      return callLocalProxy(baseUrl, options.fetcher, action, payload);
    },
  });
}

export function createUniCloudAuthApi(options: { storage?: StorageAdapter } = {}): AuthApi {
  return buildAuthApi({
    storage: options.storage || createUniStorageAdapter(),
    request(action, payload) {
      return callCloud(action, payload);
    },
  });
}

export function createAuthApi(): AuthApi {
  if (shouldUseUniCloud()) {
    return createUniCloudAuthApi();
  }

  return createLocalProxyAuthApi();
}

export const authApi = createAuthApi();

function buildAuthApi(options: {
  storage: StorageAdapter;
  request: <T>(action: AuthAction, payload: Record<string, unknown>) => Promise<T>;
}): AuthApi {
  return {
    register(credentials) {
      return options.request<AuthSession>("register", normalizeCredentials(credentials));
    },

    login(credentials) {
      return options.request<AuthSession>("login", normalizeCredentials(credentials));
    },

    getSession(token) {
      return options.request<AuthSession>("getSession", { token });
    },

    logout(token) {
      return options.request<null>("logout", { token });
    },

    async getCachedSession() {
      const cached = options.storage.get<AuthSession | null | "">(AUTH_SESSION_STORAGE_KEY);
      return isAuthSession(cached) ? cached : null;
    },

    async saveSession(session) {
      options.storage.set(AUTH_SESSION_STORAGE_KEY, session);
    },

    async clearSession() {
      options.storage.remove(AUTH_SESSION_STORAGE_KEY);
    },
  };
}

async function callCloud<T>(action: AuthAction, payload: Record<string, unknown>) {
  const uniCloudClient = getUniCloudClient();
  const response = await uniCloudClient.callFunction<T>({
    name: CLOUD_FUNCTION_NAME,
    data: {
      action,
      payload,
    },
  });
  const body = response.result;

  if (!body) {
    throw new Error("账号接口无响应");
  }

  if (!body.success) {
    throw new Error(body.message || "账号接口调用失败");
  }

  return body.data;
}

async function callLocalProxy<T>(
  baseUrl: string,
  fetcher: typeof fetch | undefined,
  action: AuthAction,
  payload: Record<string, unknown>,
) {
  const runFetch = fetcher || globalThis.fetch;

  if (!runFetch) {
    throw new Error("当前环境不支持账号代理请求");
  }

  const response = await runFetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`账号代理调用失败（${response.status}）`);
  }

  const body = (await response.json()) as CloudResponse<T>;

  if (!body.success) {
    throw new Error(body.message || "账号代理调用失败");
  }

  return body.data;
}

function normalizeCredentials(credentials: AuthCredentials) {
  return {
    username: credentials.username.trim(),
    password: credentials.password,
  };
}

function isAuthSession(value: unknown): value is AuthSession {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as AuthSession).token === "string" &&
    typeof (value as AuthSession).userId === "string" &&
    typeof (value as AuthSession).username === "string"
  );
}

function shouldUseUniCloud() {
  return import.meta.env.VITE_PROGRESS_STORAGE === "cloud" || import.meta.env.VITE_USE_UNICLOUD === "true";
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

function getUniCloudClient() {
  const uniCloudClient = (globalThis as unknown as { uniCloud?: UniCloudClient }).uniCloud;

  if (!uniCloudClient) {
    throw new Error("未检测到 uniCloud，请先绑定云服务空间");
  }

  return uniCloudClient;
}

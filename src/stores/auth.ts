import { defineStore } from "pinia";
import { authApi, type AuthCredentials, type AuthSession } from "@/services/auth-api";

interface AuthState {
  session: AuthSession | null;
  hydrated: boolean;
  loading: boolean;
  lastMessage: string;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    session: null,
    hydrated: false,
    loading: false,
    lastMessage: "",
  }),
  getters: {
    isLoggedIn(state) {
      return Boolean(state.session?.token);
    },
    username(state) {
      return state.session?.username || "";
    },
  },
  actions: {
    async hydrate() {
      if (this.hydrated) {
        return this.session;
      }

      this.loading = true;
      try {
        const cached = await authApi.getCachedSession();
        if (!cached) {
          this.session = null;
          return null;
        }

        this.session = await authApi.getSession(cached.token);
        await authApi.saveSession(this.session);
        return this.session;
      } catch (error) {
        this.session = null;
        await authApi.clearSession();
        this.lastMessage = error instanceof Error ? error.message : "登录状态已失效";
        return null;
      } finally {
        this.hydrated = true;
        this.loading = false;
      }
    },

    async register(credentials: AuthCredentials) {
      return this.authenticate(() => authApi.register(credentials), "注册成功");
    },

    async login(credentials: AuthCredentials) {
      return this.authenticate(() => authApi.login(credentials), "登录成功");
    },

    async logout() {
      const token = this.session?.token;
      this.loading = true;
      try {
        if (token) {
          await authApi.logout(token);
        }
      } finally {
        this.session = null;
        this.lastMessage = "";
        await authApi.clearSession();
        this.loading = false;
      }
    },

    async authenticate(action: () => Promise<AuthSession>, successMessage: string) {
      this.loading = true;
      try {
        const session = await action();
        this.session = session;
        this.lastMessage = successMessage;
        await authApi.saveSession(session);
        return session;
      } finally {
        this.loading = false;
      }
    },
  },
});

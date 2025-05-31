import { defineStore } from "pinia";
import { login, logout } from "@/api/auth";
import type { LoginCredentials } from "@/api/auth";
import { storage } from "@/utils/storage";

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: storage.getAccessToken(),
    refreshToken: storage.getRefreshToken(),
    user: null,
    isAuthenticated: !!storage.getAccessToken(),
  }),

  getters: {
    isAdmin: (state) => state.user?.role === "admin",
  },

  actions: {
    async login(credentials: LoginCredentials) {
      try {
        const res = await login(credentials);
        if (res.code === 0) {
          const { accessToken, refreshToken, expiresIn } = res.data as any;
          this.accessToken = accessToken
          this.refreshToken = refreshToken
          console.log('accessToken, refreshToken, expiresIn', accessToken, refreshToken, expiresIn)
          this.isAuthenticated = true;
          storage.setTokens(accessToken, refreshToken, expiresIn)
        }
        // this.user = data.user;
        return res;
      } catch (error) {
        throw error;
      }
    },

    async logout() {
      try {
        await logout();
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        this.isAuthenticated = false;
        storage.clearTokens()
      } catch (error) {
        console.error("登出出错", error);
      }
    },

    setUser(user: User) {
      this.user = user;
    },
  },
});

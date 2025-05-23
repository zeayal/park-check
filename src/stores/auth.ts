import { defineStore } from "pinia";
import { login, logout } from "@/api/auth";
import type { LoginCredentials } from "@/api/auth";

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem("token"),
    user: null,
    isAuthenticated: !!localStorage.getItem("token"),
  }),

  getters: {
    isAdmin: (state) => state.user?.role === "admin",
  },

  actions: {
    async login(credentials: LoginCredentials) {
      try {
        const data = await login(credentials);
        this.token = data.token;
        this.user = data.user;
        this.isAuthenticated = true;
        localStorage.setItem("token", data.token);
        return data;
      } catch (error) {
        throw error;
      }
    },

    async logout() {
      try {
        await logout();
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem("token");
      } catch (error) {
        console.error("登出出错", error);
      }
    },

    setUser(user: User) {
      this.user = user;
    },
  },
});

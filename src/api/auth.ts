import { storage } from "@/utils/storage";
import apiClient from "./index";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  data: {
    token: string;
  };
  msg: string
}

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    "/api/monster/admin/login",
    credentials
  );
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
  storage.clearTokens();
};

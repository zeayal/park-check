import { storage } from "@/utils/storage";
import axios from "axios";
import { ElMessage } from "element-plus";

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000,
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    const code = response.data.code;
    const msg = response.data.msg;
    if (code == 0) {
      ElMessage.success(msg);
    } else {
      ElMessage.error(msg);
    }
    if ([403, 401].includes(code)) {
      // storage.
      window.location.href = "/admin/login";
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

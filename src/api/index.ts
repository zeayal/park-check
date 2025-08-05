import { storage } from "@/utils/storage";
import axios from "axios";
import { ElMessage } from "element-plus";

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000,
});

let getAccessTokenPromise: Promise<void> | null = null;

// 请求拦截器
apiClient.interceptors.request.use(
  async (config) => {
    if (storage.isAccessTokenExpired()) {
      if (!getAccessTokenPromise) {
        // access_token 已过期
        console.log("进入令牌刷新逻辑"); // 新增日志
        const refreshToken = storage.getRefreshToken();
        getAccessTokenPromise = axios
          .get("/api/users/refreshToken", {
            params: {
              refreshToken,
            },
          })
          .then((res) => {
            const { code, data } = res.data;
            if (code === 0) {
              const { accessToken, refreshToken, expiresIn } = data;
              storage.setTokens(accessToken, refreshToken, expiresIn);
            }
          })
          .finally(() => {
            getAccessTokenPromise = null;
          });
      }

      // 等待令牌刷新完成
      await getAccessTokenPromise;
    }

    const access_token = storage.getAccessToken();
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
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
      ElMessage.success({ message: msg, duration: 1000 });
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

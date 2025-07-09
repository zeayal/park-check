const storage = {
  getAccessToken() {
    return localStorage.getItem("access_token");
  },
  getRefreshToken() {
    return localStorage.getItem("refresh_token");
  },
  setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem(
      "token_expire_time",
      String(Date.now() + expiresIn * 1000)
    );
  },
  clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expire_time");
  },
  isAccessTokenExpired() {
    const expireTime = Number(localStorage.getItem("token_expire_time"));
    return !expireTime || Date.now() >= expireTime; // true 已过期
  },
  /**
   * 存储数据到 localStorage
   * @param {string} key - 存储的键名
   * @param {any} value - 存储的值，可以是任意类型
   * @param {boolean} [isJson=true] - 是否序列化为 JSON，默认为 true
   * @returns {boolean} - 是否存储成功
   */
  set(key: string, value: any, isJson = true) {
    try {
      const storedValue = isJson ? JSON.stringify(value) : String(value);
      localStorage.setItem(key, storedValue);
      return true;
    } catch (error: any) {
      console.error(`localStorage set error: ${error.message}`);
      return false;
    }
  },

  /**
   * 从 localStorage 获取数据
   * @param {string} key - 要获取的键名
   * @param {any} [defaultValue=null] - 未找到时的默认值
   * @param {boolean} [isJson=true] - 是否解析为 JSON，默认为 true
   * @returns {any} - 存储的值或默认值
   */
  get(key: string, defaultValue = null, isJson = true) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      return isJson ? JSON.parse(value) : value;
    } catch (error: any) {
      console.error(`localStorage get error: ${error.message}`);
      return defaultValue;
    }
  },

  /**
   * 从 localStorage 删除数据
   * @param {string} key - 要删除的键名
   * @returns {boolean} - 是否删除成功
   */
  remove(key: string) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error: any) {
      console.error(`localStorage remove error: ${error.message}`);
      return false;
    }
  },

  /**
   * 清空所有 localStorage 数据
   * @returns {boolean} - 是否清空成功
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error: any) {
      console.error(`localStorage clear error: ${error.message}`);
      return false;
    }
  },
};

export { storage };

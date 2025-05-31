const storage = {
    getAccessToken() { return localStorage.getItem('access_token') },
    getRefreshToken() { return localStorage.getItem('refresh_token') },
    setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('token_expire_time', String(Date.now() + expiresIn * 1000));
    },
    clearTokens() {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('token_expire_time')
    },
    isAccessTokenExpired() {
        const expireTime = Number(localStorage.getItem('token_expire_time'));
        return !expireTime || Date.now() >= expireTime // true 已过期
    }
}

export {
    storage
}
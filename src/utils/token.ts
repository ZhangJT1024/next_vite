/**
 * Token 管理工具类
 * 使用 Cookie 存储 Token 以提高安全性
 */
const tokenManager = {
  /**
   * 将 Token 存入 Cookie
   * @param token 登录后获得的 token
   * @param days 有效期（天）
   */
  setToken: (token: string, days: number = 7) => {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = date.toUTCString()

    // 使用 document.cookie 存储
    // 注意：为了防止 XSS 攻击，生产环境建议由后端通过 HttpOnly Cookie 设置
    document.cookie = `token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`
  },

  /**
   * 从 Cookie 获取 Token
   * @returns |null
   */
  getToken: (): string | null => {
    const cookieValue = document.cookie.split('; ').find((c) => c.startsWith('token='))

    if (cookieValue) {
      return decodeURIComponent(cookieValue.split('=')[1])
    }
    return null
  },

  /**
   * 清除 Cookie 中的 Token
   */
  clearToken: () => {
    // 设置过期时间为过去，从而删除
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    // 同时清理其他可能存在的用户信息（如果后续有的话）
    localStorage.removeItem('user_info')
  },

  /**
   * 判断用户是否登录
   * @returns boolean
   */
  isLoggedIn: (): boolean => {
    return !!tokenManager.getToken()
  },
}

export default tokenManager

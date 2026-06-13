// API 基础 URL（可从环境变量读取）
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 通用请求方法
export function request<T>(options: { url: string; method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; data?: any }) {
  return fetch(`${BASE_URL}${options.url}`, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: options.data ? JSON.stringify(options.data) : undefined
  }).then(res => res.json() as Promise<T>)
}
// 导出登录相关 API
export * from './login'
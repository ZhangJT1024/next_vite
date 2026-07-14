/**
 * Axios 封装 - 优化版
 * 提供类型安全的 HTTP 请求方法
 */
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from './types'

// 重新导出类型，方便外部使用
export type {
  ApiResponse,
  UserInfo,
  LoginResponse,
  PaginateResponse,
  PaginateParams,
} from './types'

// ==================== 常量配置 ====================

/**
 * HTTP 错误码映射表
 */
const HTTP_ERROR_MAP: Record<number, string> = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '无权限访问',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
}

// ==================== 创建 Axios 实例 ====================

function createRequestInstance(
  baseURL: string = import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: number = 30000,
): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 携带 Token
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // 开发环境日志
      if (import.meta.env.DEV) {
        console.log('[API Request]', {
          url: config.url,
          method: config.method?.toUpperCase(),
          params: config.params,
          data: config.data,
        })
      }

      return config
    },
    (error) => {
      console.error('[Request Error]', error)
      return Promise.reject(error)
    },
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse | Promise<never> => {
      const res = response.data as ApiResponse

      // 判断是否是标准业务响应格式
      if (res && typeof res.code === 'number') {
        // 成功状态码（2xx）
        if (res.code >= 200 && res.code < 300) {
          // 如果有 data 字段，提取并重新赋值给 response.data
          // 这样 httpRequest 返回的就是业务数据而不是完整的 ApiResponse
          if ('data' in res) {
            response.data = res.data
          }
          return response
        }

        // 业务错误
        const errorMsg = res.msg || '请求失败'
        console.warn('[Business Error]', errorMsg)
        return Promise.reject(new AxiosError(errorMsg, 'EBUSINESS'))
      }

      // 非标准格式，直接返回
      return response
    },
    (error: AxiosError) => {
      // HTTP 状态码错误处理
      if (error.response) {
        const { status, data } = error.response
        const res = data as ApiResponse

        // 401 特殊处理：清除 token 并跳转登录页
        if (status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }

        const errorMsg = res?.msg || HTTP_ERROR_MAP[status] || `请求失败 (${status})`
        console.error(`[HTTP Error ${status}]`, errorMsg)
      } else if (error.code === 'ERR_NETWORK') {
        console.error('[Network Error]', '网络连接失败，请检查网络')
      } else if (error.code === 'ECONNABORTED') {
        console.error('[Timeout Error]', '请求超时，请稍后重试')
      } else {
        console.error('[Unknown Error]', error.message)
      }

      return Promise.reject(error)
    },
  )

  return instance
}

// 默认实例
const request = createRequestInstance()

// ==================== 请求方法封装 ====================

/**
 * 通用请求方法 - 自动提取业务数据
 * @template T - 期望的业务数据类型
 * @param config - Axios 请求配置
 * @returns Promise<T> - 直接返回业务数据
 */
function httpRequest<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  return request(config).then((response) => {
    const res = response.data as ApiResponse<T>

    // 如果是标准业务格式 { code, data, msg }，返回 data 字段
    if (res && typeof res.code === 'number' && 'data' in res) {
      return res.data
    }

    // 否则返回完整的响应数据
    return response.data as T
  })
}

/**
 * GET 请求
 * @template T - 期望的响应数据类型
 * @param url - 请求地址
 * @param params - 查询参数
 * @param config - 其他配置
 * @returns Promise<T> - 返回类型为 T 的 Promise
 *
 * @example
 * const user = await get<UserInfo>('/user/1');
 * const users = await get<UserInfo[]>('/users', { page: 1 });
 */
function get<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params'>,
): Promise<T> {
  return httpRequest<T>({ url, method: 'GET', params, ...config })
}

/**
 * POST 请求
 * @template T - 期望的响应数据类型
 * @param url - 请求地址
 * @param data - 请求体数据
 * @param config - 其他配置
 * @returns Promise<T> - 返回类型为 T 的 Promise
 *
 * @example
 * const user = await post<UserInfo>('/users', { name: '张三' });
 */
function post<T = unknown>(
  url: string,
  data?: unknown,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>,
): Promise<T> {
  return httpRequest<T>({ url, method: 'POST', data, ...config })
}

/**
 * PUT 请求
 * @template T - 期望的响应数据类型
 * @param url - 请求地址
 * @param data - 请求体数据
 * @param config - 其他配置
 * @returns Promise<T> - 返回类型为 T 的 Promise
 */
function put<T = unknown>(
  url: string,
  data?: unknown,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>,
): Promise<T> {
  return httpRequest<T>({ url, method: 'PUT', data, ...config })
}

/**
 * DELETE 请求
 * @template T - 期望的响应数据类型
 * @param url - 请求地址
 * @param params - 查询参数
 * @param config - 其他配置
 * @returns Promise<T> - 返回类型为 T 的 Promise
 */
function del<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params'>,
): Promise<T> {
  return httpRequest<T>({ url, method: 'DELETE', params, ...config })
}

/**
 * PATCH 请求
 * @template T - 期望的响应数据类型
 * @param url - 请求地址
 * @param data - 请求体数据
 * @param config - 其他配置
 * @returns Promise<T> - 返回类型为 T 的 Promise
 */
function patch<T = unknown>(
  url: string,
  data?: unknown,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>,
): Promise<T> {
  return httpRequest<T>({ url, method: 'PATCH', data, ...config })
}

// ==================== 导出 ====================

export { Register, Login, Logout } from './login'
export { createRequestInstance, request, get, post, put, del, patch }

export default request

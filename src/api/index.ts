/**
 * Axios 封装 - 优化版
 * 提供类型安全的 HTTP 请求方法
 */
import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import type { ApiResponse } from './types';

// 重新导出类型，方便外部使用
export type {
  ApiResponse,
  UserInfo,
  LoginResponse,
  PaginateResponse,
  PaginateParams,
} from './types';

// ==================== 创建 Axios 实例 ====================

function createRequestInstance(
  baseURL: string = import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: number = 30000
): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 携带 Token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 开发环境日志
      if (import.meta.env.DEV) {
        console.log('[API Request]', {
          url: config.url,
          method: config.method?.toUpperCase(),
          params: config.params,
          data: config.data,
        });
      }

      return config;
    },
    (error) => {
      console.error('[Request Error]', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse | Promise<never> => {
      const res = response.data as ApiResponse;

      // 判断是否是标准业务响应格式
      if (res && typeof res.code === 'number') {
        // 成功状态码（2xx）
        if (res.code >= 200 && res.code < 300) {
          // 如果有 data 字段，提取并重新赋值给 response.data
          // 这样 httpRequest 返回的就是业务数据而不是完整的 ApiResponse
          if ('data' in res) {
            response.data = res.data;
          }
          return response;
        }

        // 业务错误
        const errorMsg = res.msg || '请求失败';
        console.warn('[Business Error]', errorMsg);
        return Promise.reject(new AxiosError(errorMsg, 'EBUSINESS'));
      }

      // 非标准格式，直接返回
      return response;
    },
    (error: AxiosError) => {
      // HTTP 状态码错误处理
      if (error.response) {
        const { status, data } = error.response;
        const res = data as ApiResponse;

        switch (status) {
          case 401:
            console.error('[Auth Error]', '未授权，请重新登录');
            localStorage.removeItem('token');
            window.location.href = '/login';
            break;
          case 403:
            console.error('[Permission Error]', res?.msg || '无权限访问');
            break;
          case 404:
            console.error('[Not Found]', '请求的资源不存在');
            break;
          case 500:
            console.error('[Server Error]', res?.msg || '服务器内部错误');
            break;
          default:
            console.error('[HTTP Error]', `状态码: ${status}`);
        }
      } else if (error.code === 'ERR_NETWORK') {
        console.error('[Network Error]', '网络连接失败，请检查网络');
      } else if (error.code === 'ECONNABORTED') {
        console.error('[Timeout Error]', '请求超时，请稍后重试');
      } else {
        console.error('[Unknown Error]', error.message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

// 默认实例
const request = createRequestInstance();

// ==================== 请求方法封装 ====================

/**
 * 通用请求方法 - 自动提取业务数据
 * @template T - 期望的业务数据类型
 * @param config - Axios 请求配置
 * @returns Promise<T> - 直接返回业务数据
 */
function httpRequest<T = any>(
  config: AxiosRequestConfig
): Promise<T> {
  return request(config).then((response) => {
    const res = response.data as ApiResponse<T>;

    // 如果是标准业务格式 { code, data, msg }，返回 data 字段
    if (res && typeof res.code === 'number' && 'data' in res) {
      return res.data;
    }

    // 否则返回完整的响应数据
    return response.data as T;
  });
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
function get<T = any>(
  url: string,
  params?: Record<string, any>,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params'>
): Promise<T> {
  return httpRequest<T>({ url, method: 'GET', params, ...config });
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
function post<T = any>(
  url: string,
  data?: any,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
): Promise<T> {
  return httpRequest<T>({ url, method: 'POST', data, ...config });
}

/**
 * PUT 请求
 * @template T - 期望的响应数据类型
 * @param url - 请求地址
 * @param data - 请求体数据
 * @param config - 其他配置
 * @returns Promise<T> - 返回类型为 T 的 Promise
 */
function put<T = any>(
  url: string,
  data?: any,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
): Promise<T> {
  return httpRequest<T>({ url, method: 'PUT', data, ...config });
}

/**
 * DELETE 请求
 * @template T - 期望的响应数据类型
 * @param url - 请求地址
 * @param params - 查询参数
 * @param config - 其他配置
 * @returns Promise<T> - 返回类型为 T 的 Promise
 */
function del<T = any>(
  url: string,
  params?: Record<string, any>,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params'>
): Promise<T> {
  return httpRequest<T>({ url, method: 'DELETE', params, ...config });
}

/**
 * PATCH 请求
 * @template T - 期望的响应数据类型
 * @param url - 请求地址
 * @param data - 请求体数据
 * @param config - 其他配置
 * @returns Promise<T> - 返回类型为 T 的 Promise
 */
function patch<T = any>(
  url: string,
  data?: any,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
): Promise<T> {
  return httpRequest<T>({ url, method: 'PATCH', data, ...config });
}

// ==================== 导出 ====================

export {
  createRequestInstance,
  request,
  get,
  post,
  put,
  del,
  patch,
};

export default request;

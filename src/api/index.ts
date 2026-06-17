import axios, { AxiosRequestConfig } from 'axios';

/**
 * axios 基础配置
 * @param baseURL - 基础请求地址
 * @param config - 基础请求配置
 */
const createRequestInstance = (baseURL: string = import.meta.env.VITE_API_BASE_URL || '/api', config:any = {}) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    ...config,
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 携带 Token 逻辑
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // 可以在这里添加更多的请求拦截逻辑，例如记录日志、动态修改 Header 等
      return config;
    },
    (error) => {
      // 请求拦截器错误处理
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      const res = response.data;
      // 根据后端约定的状态码进行处理（例如 200 是成功）
      // 如果后端返回的结构是 { code: 200, data: {}, msg: "" }，则在此处提取
      return res;
    },
    (error) => {
      // 响应拦截器错误处理
      const { response } = error;
      if (response && response.status === 401) {
        // 未授权处理，例如清除 token 并跳转登录
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      console.error('API Error:', error.message);
      return Promise.reject(error);
    }
  );

  return instance;
};

// 创建请求实例
const requestInstance = createRequestInstance();

/**
 * 统一请求方法封装
 * @param url - 请求路径
 * @param method - 请求方法 (GET, POST, PUT, DELETE, etc.)
 * @param data - 请求参数
 * @param config - 其他配置项
 * @returns {Promise<any>}
 */
export const request = (method: string = 'GET',url: string,  data?: any, config?: AxiosRequestConfig) => {
  return requestInstance.request({
    url,
    method,
    data,
    ...config,
  });
};

/**
 * 快捷请求方法封装
 * @param url - 请求路径
 * @param data - 请求参数
 * @returns {Promise<any>}
 */
export const post = (url: string, data?: any) => {
  return request('POST',url,  data);
};

/**
 * 快捷请求方法封装
 * @param url - 请求路径
 * @returns {Promise<any>}
 */
export const get = (url: string) => {
  return request('GET', url);
};

/**
 * 快捷请求方法封装
 * @param url - 请求路径
 * @param data - 请求参数
 * @returns {Promise<any>}
 */
export const put = (url: string, data?: any) => {
  return request('PUT', url, data);
};

/**
 * 快捷请求方法封装
 * @param url - 请求路径
 * @param data - 请求参数
 * @returns {Promise<any>}
 */
export const del = (url: string, data?: any) => {
  return request('DELETE', url, data);
};

// 导出登录相关 API (保留原有导出结构)
export * from './login';

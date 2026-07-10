/**
 * API 相关类型定义
 */

/**
 * 后端统一响应结构
 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg?: string;
}

/**
 * 用户信息
 */
export interface UserInfo {
  id?: number | string;
  username?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role?: string[];
  permissions?: string[];
  [key: string]: any;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string;
  userInfo?: UserInfo;
  expiresIn?: number;
}

/**
 * 分页数据
 */
export interface PaginateResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 分页查询参数
 */
export interface PaginateParams {
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

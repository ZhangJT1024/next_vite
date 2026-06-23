// 用户信息接口
export interface UserInfo {
  id: number
  accoount: string
  username: string
  nickname: string
  avatar?: string
  role: 'admin' | 'user' | 'editor'
  email?: string
  phone?: string
}

// 权限信息接口
export interface PermissionInfo {
  id: number
  name: string
  code: string
  path: string
  type: 'menu' | 'button'
}

// API 响应基础结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页参数
export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

// 分页响应
export interface PaginationResponse<T = any> {
  list: T[]
  total: number
  page: number
  limit: number
}

// 通用请求参数
export interface RequestParams {
  params?: Record<string, any>
  query?: Record<string, any>
}

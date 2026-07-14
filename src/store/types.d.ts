// Store 类型定义
export interface UserState {
  userInfo: UserInfo | null
  token: string | null
  roles: string[]
}

export interface PermissionState {
  permissions: string[]
  routes: any[]
}

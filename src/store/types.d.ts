// Store 类型定义

import { DefineStore } from 'pinia'

export interface UserState {
  userInfo: UserInfo | null
  token: string | null
  roles: string[]
}

export interface PermissionState {
  permissions: string[]
  routes: any[]
}

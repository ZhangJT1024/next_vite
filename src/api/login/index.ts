import { post } from '../index'

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData extends LoginData {
  nickname?: string
}

// 注册账号
export function Register(data: RegisterData) {
  return post('/api/login/createrAccounts', data)
}
// 登录账号
export function Login(data: LoginData) {
  return post('/api/login', data)
}
// 登出账号
export function Logout(data: { account: string }) {
  return post('/api/login/logoutAccounts', data)
}

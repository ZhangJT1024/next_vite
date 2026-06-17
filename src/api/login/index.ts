import {request} from "../index"
// 注册账号
export function Register(data: { username: string; password: string; nickname: string }) {
  return request('POST','/api/login/createrAccounts',data)
}
// 登录账号
export function Login(data: { username: string; password: string; nickname: string }) {
  return request('POST','/api/login',data)
}
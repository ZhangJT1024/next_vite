import {request} from "../index"
// 注册账号
export function Register(data: { username: string; password: string; nickname: string }) {
  return request({ url: '/api/login/createrAcounts', method: 'POST', data })
}
// 登录账号
export function Login(data: { username: string; password: string; nickname: string }) {
  return request({ url: '/api/login/login', method: 'POST', data })
}
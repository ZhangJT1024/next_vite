import {request} from "../index"
// 注册账号
export function Register(data: { username: string; password: string; nickname: string }) {
  return request({ url: '/api/login/createrAcounts', method: 'POST', data })
}
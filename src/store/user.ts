import { defineStore } from 'pinia'
import { UserInfo } from '@/types'
import {Register,Login,Logout} from "@/api"
import tokenManager from '@/utils/token'
import { debug } from 'console'
export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  nickname: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    token: null as string | null,
    roles: [] as string[]
  }),

  getters: {
    isLoggedIn(): boolean {
      return !!this.token
    },
    hasRole(role: string): boolean {
      return this.roles.includes(role)
    }
  },

  actions: {
    // 登录
    async login(payload: RegisterPayload) {
      try {
        const response = await Login(payload)

        const data = await response.json()

        if (data.code === 200) {
          this.userInfo = data.data.user
          this.token = data.data.token
          this.roles = data.data.roles || ['user']
          return { success: true, userInfo: data.data.user }
        } else {
          throw new Error(data.message)
        }
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },

    // 注册
    async register(payload: RegisterPayload) {
      try {
        const response: any = await Register(payload)
        console.log(response,'注册')
        if (response?.data?.status === 200) {
          this.token = response.data.token
          this.userInfo = response.data.userInfo
          tokenManager.setToken(response.data.token)
          return { status: true }
        }
      } catch (error) {
        console.error('注册失败:', error)

      }
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await fetch('/api/user/info', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })

        const data = await response.json()

        if (data.code === 200) {
          this.userInfo = data.data.user
          this.roles = data.data.roles || ['user']
          return { success: true, userInfo: data.data.user }
        } else {
          throw new Error(data.message)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },

    // 登出
    async logout(payload:any) {
      try {
        console.log('正在登出用户:', payload,this.userInfo)
        debugger
        await Logout({ account: this.userInfo.account || ''  })
 
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        this.reset()
      }
    },

    // 更新用户信息
    async updateUserInfo(updateData: Partial<UserInfo>) {
      try {
        const response = await fetch('/api/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify(updateData)
        })

        const data = await response.json()

        if (data.code === 200) {
          this.userInfo = { ...this.userInfo, ...data.data }
          return { success: true, userInfo: data.data }
        } else {
          throw new Error(data.message)
        }
      } catch (error) {
        console.error('更新用户信息失败:', error)
        throw error
      }
    },

    // 重置状态
    reset() {
      this.userInfo = null
      this.token = null
      this.roles = []
    }
  },

  persist: {
    key: 'user-storage',
    paths: ['token', 'userInfo', 'roles'],
  }
})
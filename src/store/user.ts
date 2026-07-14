import { defineStore } from 'pinia'
import { UserInfo } from '@/types'
import { Register, Login, Logout } from '@/api'
import tokenManager from '@/utils/token'

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  nickname: string
}

export interface LoginResult {
  userInfo: UserInfo
  token: string
  roles?: string[]
}

export interface RegisterResult {
  status: number
  token: string
  userInfo: UserInfo
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    token: null as string | null,
    roles: [] as string[],
  }),

  getters: {
    isLoggedIn(): boolean {
      return !!this.token
    },
    hasRole: (state) => {
      return (role: string): boolean => state.roles.includes(role)
    },
  },

  actions: {
    // 登录
    async login(payload: LoginPayload) {
      try {
        const data = (await Login(payload)) as LoginResult
        if (data.userInfo && data.token) {
          this.userInfo = data.userInfo
          this.token = data.token
          this.roles = data.roles || ['user']
          return { success: true, userInfo: data.userInfo }
        } else {
          throw new Error('登录失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },

    // 注册
    async register(payload: RegisterPayload) {
      try {
        const data = (await Register(payload)) as RegisterResult
        console.log(data, '注册')
        if (data?.status === 200) {
          this.token = data.token
          this.userInfo = data.userInfo
          tokenManager.setToken(data.token)
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
          headers: { Authorization: `Bearer ${this.token}` },
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
    async logout(_payload?: unknown) {
      try {
        await Logout({ account: this.userInfo?.account || '' })
        this.$reset()
      } catch (error) {
        console.error('登出失败:', error)
      }
    },

    // 更新用户信息
    async updateUserInfo(updateData: Partial<UserInfo>) {
      try {
        const response = await fetch('/api/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify(updateData),
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
      console.log('开始情况')

      this.userInfo = null
      this.token = null
      this.roles = []
    },
  },

  persist: {
    key: 'user-storage',
    paths: ['token', 'userInfo', 'roles'],
  },
})

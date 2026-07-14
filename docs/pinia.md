# Pinia 状态管理文档

本项目采用 **Pinia** 作为 Vue 项目的状态管理库。Pinia 提供了简洁且直观的 API，非常适合处理复杂的跨组件状态共享。

## 1. 环境准备

首先，确保项目中已安装 `pinia` 依赖。

```bash
npm install pinia
# 或者使用 yarn
yarn add pinia
```

## 2. 项目配置

在项目的入口文件 `src/main.ts` 中注册 Pinia 实例。

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 实例化并使用 Pinia
app.use(createPinia())

app.use(router)
app.mount('#app')
```

## 3. 状态管理实现 (Store)

本项目中的 Store 通常定义在 `src/store/` 目录下。每一个 Store 文件通常导出一个 `useXXXStore` 函数。

### 基本结构
使用 `defineStore` 来定义状态、计算属性（Getters）和动作（Actions）。

```typescript
// src/store/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // 1. State: 定义响应式数据
  state: () => ({
    userInfo: null as any,
    token: null as string | null,
    roles: [] as string[]
  }),

  // 2. Getters: 基于 State 的计算属性
  getters: {
    isLoggedIn(): boolean {
      return !!this.token
    },
    hasRole(role: string): boolean {
      return this.roles.includes(role)
    }
  },

  // 3. Actions: 修改状态的方法或异步请求
  actions: {
    async login(payload: any) {
      // 请求逻辑...
      this.token = 'xxx';
      this.userInfo = {};
    },
    
    reset() {
      this.userInfo = null;
      this.token = null;
      this.roles = [];
    }
  }
})
```

## 4. 组件内使用步骤

在 Vue 组件中，只需导入并调用对应的 Store 即可。

### 在 Setup 语法糖中 (Composition API)

```vue
<template>
  <div>
    <p v-if="userStore.isLoggedIn">欢迎回来, {{ userStore.userInfo?.nickname }}</p>
    <button @click="userStore.login(loginData)">登录</button>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { reactive } from 'vue'

const userStore = useUserStore()

const loginData = reactive({
  username: '',
  password: ''
})
</script>
```

## 5. 核心概念总结

| 概念 | 说明 | 对应概念 (Vue) |
| :--- | :--- | :--- |
| **State** | 存储数据的响应式对象 | `ref`, `reactive` |
| **Getters** | 基于 State 的衍生数据 | `computed` |
| **Actions** | 修改 State 的方法，支持异步 | `methods` |

## 6. 持久化配置 (Persistence)

本项目使用 `pinia-plugin-persistedstate` 实现状态持久化，确保页面刷新后数据（如登录状态）不丢失。

### 配置步骤：
1. **安装插件**: `npm install pinia-plugin-persistedstate`
2. **全局注册**: 在 `src/main.ts` 中使用 `pinia.use(piniaPersistedstate)`。
3. **开启持久化**: 在 `defineStore` 中添加 `persist` 配置。

### 示例代码 (src/store/user.ts):
```typescript
export const useUserStore = defineStore('user', {
  state: () => ({
    token: null as string | null,
    userInfo: null as any,
  }),
  persist: {
    key: 'user-storage',        // 在 localStorage 中的 key
    paths: ['token', 'userInfo'], // 指定需要持久化的字段
  },
})
```

## 7. 注意事项

1. **响应式丢失**：在解构 Store 时，直接解构会丢失响应式。如果需要解构，请使用 `storeToRefs`。
   ```typescript
   import { storeToRefs } from 'pinia'
   const userStore = useUserStore()
   const { userInfo, isLoggedIn } = storeToRefs(userStore)
   ```
2. **类型支持**：本项目支持 TypeScript。在定义 Store 时，建议为 `state` 中的字段定义明确的类型接口。
3. **异步处理**：Actions 中可以直接使用 `async/await`。

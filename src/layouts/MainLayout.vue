<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="layout-sidebar">
      <div class="logo">
        <h3>管理系统</h3>
      </div>

      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <template v-for="route in routes" :key="route.path">
          <el-menu-item :index="route.path">
            <template #default>
              <el-icon><component :is="route.meta?.icon || 'Menu'" /></el-icon>
              <span>{{ route.meta?.title }}</span>
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主容器 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <h4>{{ currentTitle }}</h4>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              {{ currentUser?.nickname || '管理员' }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout" class="danger-text">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="route-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { UserFilled, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { usePermissionStore } from '@/store/permission'
import { log } from 'console'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// 当前标题
const currentTitle = computed(() => {
  return (route.meta.title as string) || '后台管理系统'
})

// 激活菜单
const activeMenu = computed(() => {
  return route.path
})

// 获取用户信息
const currentUser = computed(() => {
  return userStore.userInfo
})

// 路由配置
const routes = [
  { path: '/dashboard/home', meta: { title: '仪表盘' } },
  { path: '/dashboard/users', meta: { title: '用户管理' } },
  { path: '/dashboard/roles', meta: { title: '角色管理' } },
  { path: '/dashboard/settings', meta: { title: '系统设置' } },
  { path: '/dashboard/ai', meta: { title: 'AI 对话' } }
]

// 处理命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout().finally(()=>{
    router.push('/login')
    })
    console.log('进入此处了');
  } else if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'settings') {
    router.push('/settings')
  }
}

// 加载权限
onMounted(() => {
  // TODO: 实际项目中需要调用 API 获取用户信息和权限
  if (userStore.isLoggedIn) {
    permissionStore.addRoutes(routes)
  }
})
</script>

<style scoped lang="scss">
.layout-container {
  width: 100%;
  height: 100vh;
}

.layout-sidebar {
  background-color: #304156;
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 18px;
    font-weight: bold;
  }
}

.layout-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;

  .header-left {
    h4 {
      margin: 0;
      color: #303133;
    }
  }

  .user-info {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }

    .danger-text {
      color: #f56c6c;
    }
  }
}

.layout-main {
  background-color: #f0f2f5;
  padding: 20px;

  :deep(.el-card) {
    margin-bottom: 20px;
  }
}

// 路由过渡动画
.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 0.3s;
}

.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
}
</style>

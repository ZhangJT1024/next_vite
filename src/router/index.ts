import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes: RouteRecordRaw[] = [
  // 欢迎页（根路径）
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/views/welcome/index.vue'),
    meta: { title: '欢迎 - 后台管理系统' }
  },

  // 布局路由
  {
    path: '/dashboard',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard/home',
    children: [
      {
        path: 'home',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'DataAnalysis' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/role/index.vue'),
        meta: { title: '角色管理', icon: 'Coordinate' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  },

  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },

  // 注册页
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: { title: '注册' }
  },

  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/dashboard/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (!userStore.isLoggedIn && to.name !== 'Login' && to.name !== 'Register') {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (userStore.isLoggedIn && (to.name === 'Login' || to.name === 'Register')) {
    next({ name: 'Dashboard/home' })
  } else {
    document.title = to.meta.title ? `${to.meta.title as string} - 后台管理系统` : '后台管理系统'
    next()
  }
})

export default router

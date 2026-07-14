import { defineStore } from 'pinia'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: [] as string[],
    routes: [] as Record<string, unknown>[],
  }),

  actions: {
    // 生成可访问的菜单
    generateMenus(permissions: string[]) {
      const menus: Record<string, unknown>[] = []

      for (const permission of permissions) {
        // 解析权限码为路由路径
        const path = permission.replace('^', '').replace('$', '')

        if (path.startsWith('/')) {
          const menu = {
            path,
            name: path.split('/').pop() || '菜单',
            meta: {
              title: this.getMenuTitle(path),
              icon: this.getIconByPath(path),
            },
          }

          if (!menus.find((m) => m.path === path)) {
            menus.push(menu)
          }
        }
      }

      return menus
    },

    // 获取菜单标题
    getMenuTitle(path: string): string {
      const titleMap: Record<string, string> = {
        '/dashboard': '仪表盘',
        '/users': '用户管理',
        '/roles': '角色管理',
        '/settings': '系统设置',
        '/profile': '个人信息',
      }
      return titleMap[path] || path.replace('/', '')
    },

    // 根据路径获取图标
    getIconByPath(path: string): string {
      const iconMap: Record<string, string> = {
        '/dashboard': 'DataAnalysis',
        '/users': 'User',
        '/roles': 'Coordinate',
        '/settings': 'Setting',
        '/profile': 'UserFilled',
      }
      return iconMap[path] || ''
    },

    // 添加权限路由
    addRoutes(routes: Record<string, unknown>[]) {
      this.routes.push(...routes)
    },
  },
})

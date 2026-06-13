// Mock 数据（用于本地开发测试）

// 用户列表 mock
export const mockUserList = [
  { id: 1, username: 'admin', nickname: '管理员', email: 'admin@example.com', phone: '13800138000', role: 'admin', status: 'enabled' },
  { id: 2, username: 'user1', nickname: '张三', email: 'zhangsan@example.com', phone: '13900139000', role: 'editor', status: 'enabled' },
  { id: 3, username: 'user2', nickname: '李四', email: 'lisi@example.com', phone: '13700137000', role: 'user', status: 'disabled' }
]

// 角色列表 mock
export const mockRoleList = [
  { id: 1, name: '超级管理员', code: '^admin$', description: '拥有系统所有权限', status: 'enabled', createdAt: '2024-01-01' },
  { id: 2, name: '编辑者', code: '^editor$', description: '可以编辑和管理内容', status: 'enabled', createdAt: '2024-01-05' },
  { id: 3, name: '普通用户', code: '^user$', description: '基础的查看权限', status: 'enabled', createdAt: '2024-01-10' }
]

// Mock 接口响应
export const mockLogin = (username: string, password: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: 'success',
        data: {
          token: 'mock_token_' + Date.now(),
          user: {
            id: 1,
            username: username,
            nickname: username === 'admin' ? '管理员' : '用户',
            role: username === 'admin' ? 'admin' : 'user',
            email: 'test@example.com',
            phone: '13800000000',
            lastLoginTime: new Date().toISOString()
          },
          roles: [username === 'admin' ? 'admin' : 'user']
        }
      })
    }, 500)
  })
}

export const mockRegister = (data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: 'success',
        data: true
      })
    }, 500)
  })
}

export default { mockUserList, mockRoleList, mockLogin, mockRegister }

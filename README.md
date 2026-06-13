# 后台管理系统

基于 Vite + Vue3 + Pinia + Element Plus 的现代化后台管理系统

## ✨ 特性

- ⚡️ **极速启动** - 基于 Vite 5.x，秒级热更新
- 🎨 **Element Plus** - 丰富的 UI 组件库
- 🔌 **Pinia** - 轻量级状态管理
- 🔄 **TypeScript** - 完整的类型支持
- 🧪 **单元测试** - Vitest 测试框架
- 📱 **响应式设计** - 完美适配各种屏幕

## 📦 技术栈

- Vue 3 (Composition API)
- Vite 5.2
- Element Plus
- Pinia
- TypeScript
- Vue Router

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
# 或者
yarn install
```

### 2. 开发模式

```bash
npm run dev
# 或者
yarn dev
```

浏览器访问：http://localhost:3001

### 3. 构建生产版本

```bash
npm run build
# 或者
yarn build
```

### 4. 预览构建结果

```bash
npm run preview
# 或者
yarn preview
```

## 📁 项目结构

```
vite/
├── public/              # 静态资源
├── src/
│   ├── api/            # API 接口
│   ├── assets/         # 静态资源
│   ├── components/     # 公共组件
│   ├── layouts/        # 布局组件
│   ├── router/         # 路由配置
│   ├── store/          # Pinia 状态管理
│   ├── styles/         # 全局样式
│   ├── types/          # TypeScript 类型
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   │   ├── dashboard/  # 仪表盘
│   │   ├── login/      # 登录页
│   │   ├── register/   # 注册页
│   │   ├── user/       # 用户管理
│   │   ├── role/       # 角色管理
│   │   └── settings/   # 系统设置
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── index.html          # HTML 模板
├── package.json        # 项目依赖
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TS 配置
└── README.md           # 说明文档
```

## 🎯 功能模块

### 1. 仪表盘 (Dashboard)
- 用户统计卡片
- 访问数据图表
- 最近操作记录

### 2. 用户管理
- 用户列表查看
- 用户信息编辑
- 用户状态管理
- 批量操作支持

### 3. 角色管理
- 角色列表查看
- 权限码配置
- 角色启用/禁用
- 角色描述设置

### 4. 系统设置
- 基本信息配置
- 安全设置
- 数据备份恢复
- 通知中心

### 5. 登录/注册
- 用户名密码登录
- 用户注册
- 记住我功能
- 忘记密码

## 🛠️ 开发规范

### Git Flow

```bash
# 拉取最新代码
git pull origin main

# 创建新分支
git checkout -b feature/xxx

# 提交代码
git commit -m "feat: 新增用户管理功能"

# 推送到远程
git push origin feature/xxx
```

### Code Style

- 使用 ESLint 进行代码检查
- 遵循 Prettier 格式规范
- 保持代码清晰可读

## 📝 License

MIT

---

**开发者**: Your Name  
**日期**: 2024

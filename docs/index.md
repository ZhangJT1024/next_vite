# 项目文档索引

本目录包含项目的所有开发文档。

## 文档列表

| 文档 | 说明 |
|------|------|
| [ESLint + Prettier + Husky + Commitlint 配置指南](./eslint-husky-guide.md) | 代码规范工具链的完整配置说明，包括 ESLint 规则、Prettier 格式化、Git 钩子和提交规范 |
| [Pinia 状态管理文档](./pinia.md) | Pinia 的使用指南，包括 Store 定义、组件内使用、持久化配置等 |
| [API 请求规范文档](./api-guide.md) | Axios 封装的使用说明，包括拦截器、请求方法、配置参数等 |

## 快速导航

### 我是新人，应该先看什么？

1. 先阅读 [API 请求规范文档](./api-guide.md) 了解如何调用接口
2. 再阅读 [Pinia 状态管理文档](./pinia.md) 了解如何管理状态
3. 最后阅读 [ESLint 配置指南](./eslint-husky-guide.md) 了解代码规范

### 我想提交代码，需要注意什么？

阅读 [ESLint + Prettier + Husky + Commitlint 配置指南](./eslint-husky-guide.md) 中的：
- [提交规范](./eslint-husky-guide.md#七commitlint-提交规范) - commit message 格式要求
- [Git 钩子](./eslint-husky-guide.md#五husky-配置详解) - 提交前自动检查的流程

### 我想配置编辑器自动格式化

阅读 [VS Code 编辑器集成](./eslint-husky-guide.md#九vs-code-编辑器集成)

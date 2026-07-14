# API 请求规范文档

本项目使用 `axios` 封装了统一的请求模块，位于 `src/api/index.ts`。

## 1. 基础配置

- **基础地址 (Base URL)**: 从环境变量 `VITE_API_BASE_URL` 读取，默认为 `/api`。
- **超时时间**: 默认设置为 10 秒。
- **内容类型**: 默认请求头包含 `Content-Type: application/json`。

## 2. 拦截器功能

### 请求拦截器 (Request Interceptors)
- **Token 注入**: 自动从 `localStorage` 获取 `token` 并注入到请求头的 `Authorization` 字段中（格式为 `Bearer <token>`）。
- **自定义配置**: 可以在调用请求时通过 `config` 参数覆盖任何 Header 或参数。

### 响应拦截器 (Response Interceptors)
- **数据提取**: 统一返回 `response.data`。
- **401 错误处理**: 当接口返回 `401`（未授权）状态码时，自动清除 `localStorage` 中的 `token` 并跳转至 `/login` 页面。
- **错误日志**: 所有的 API 异常都会在控制台打印错误信息。

## 3. 使用方法

### 基础请求方法
使用 `request` 方法可以传入完整的请求配置：

```typescript
import { request } from '@/api';

// 示例：带参数的 POST 请求
request('/user/update', 'POST', { name: '张三' }, { responseType: 'json' })
  .then(res => {
    console.log('成功:', res);
  })
  .catch(err => {
    console.error('失败:', err);
  });
```

### 快捷请求方法
项目中封装了常用的快捷方法，简化常用操作：

| 方法 | 对应请求类型 | 示例代码 |
| :--- | :--- | :--- |
| `get(url)` | GET | `get('/user/list')` |
| `post(url, data)` | POST | `post('/user/login', { user: 'xxx' })` |
| `put(url, data)` | PUT | `put('/user/update', { id: 1 })` |
| `del(url, data)` | DELETE | `del('/user/delete', { id: 1 })` |

## 4. 配置参数说明

可以在调用 `request` 时传递 `AxiosRequestConfig` 对象，支持以下常用配置：

- `url`: 请求路径 (string)
- `method`: 请求方法 (GET, POST, PUT, DELETE)
- `data`: 请求体数据
- `params`: URL 查询参数
- `headers`: 自定义请求头
- `timeout`: 单次请求超时时间
- `responseType`: 响应数据类型
- `withCredentials`: 是否携带 Cookie

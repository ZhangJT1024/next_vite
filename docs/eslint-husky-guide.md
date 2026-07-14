# ESLint + Prettier + Husky + Commitlint 配置指南

> 本文档详细记录了项目的代码规范工具链配置，包括每个工具的作用、配置写法、使用方法和常见问题。

---

## 目录

- [一、工具概览](#一工具概览)
- [二、安装依赖](#二安装依赖)
- [三、ESLint 配置详解](#三eslint-配置详解)
  - [3.1 配置文件 `.eslintrc.cjs`](#31-配置文件-eslintrccjs)
  - [3.2 忽略文件 `.eslintignore`](#32-忽略文件-eslintignore)
  - [3.3 规则详解](#33-规则详解)
  - [3.4 如何自定义规则](#34-如何自定义规则)
- [四、Prettier 配置详解](#四prettier-配置详解)
  - [4.1 配置文件 `.prettierrc.cjs`](#41-配置文件-prettierrccjs)
  - [4.2 忽略文件 `.prettierignore`](#42-忽略文件-prettierignore)
  - [4.3 ESLint 与 Prettier 共存](#43-eslint-与-prettier-共存)
- [五、Husky 配置详解](#五husky-配置详解)
  - [5.1 Husky 是什么](#51-husky-是什么)
  - [5.2 初始化 Husky](#52-初始化-husky)
  - [5.3 pre-commit 钩子](#53-pre-commit-钩子)
  - [5.4 commit-msg 钩子](#54-commit-msg-钩子)
  - [5.5 如何添加新的钩子](#55-如何添加新的钩子)
- [六、lint-staged 配置详解](#六lint-staged-配置详解)
- [七、Commitlint 提交规范](#七commitlint-提交规范)
  - [7.1 提交格式](#71-提交格式)
  - [7.2 Type 类型说明](#72-type-类型说明)
  - [7.3 提交示例](#73-提交示例)
- [八、NPM Scripts 命令一览](#八npm-scripts-命令一览)
- [九、VS Code 编辑器集成](#九vs-code-编辑器集成)
- [十、常见问题与排查](#十常见问题与排查)
- [十一、CI/CD 集成建议](#十一cicd-集成建议)

---

## 一、工具概览

| 工具 | 作用 | 触发时机 |
|------|------|----------|
| **ESLint** | 代码质量检查（语法错误、最佳实践、潜在 bug） | 手动运行 / 编辑器实时 / git 提交时 |
| **Prettier** | 代码格式化（统一缩进、引号、换行等风格） | 手动运行 / 编辑器保存时 / git 提交时 |
| **Husky** | Git 钩子管理（在 commit/push 等节点自动执行脚本） | `git commit` 时自动触发 |
| **lint-staged** | 只对 git 暂存区（staged）的文件运行 lint/format | 被 Husky 的 pre-commit 钩子调用 |
| **Commitlint** | 校验 git commit message 是否符合规范 | 被 Husky 的 commit-msg 钩子调用 |

**整体流程：**

```
开发者修改代码
    ↓
git add .                    （将文件加入暂存区）
    ↓
git commit -m "xxx"          （触发 git 钩子）
    ↓
┌─────────────────────────────────────────┐
│ Husky pre-commit 钩子触发               │
│   ↓                                     │
│ lint-staged 执行：                       │
│   1. 对 .js/.ts/.vue 文件运行 ESLint    │
│   2. 对所有暂存文件运行 Prettier         │
│   ↓                                     │
│ 如果有错误 → 提交被阻止，需要修复        │
│ 如果通过 → 继续下一步                    │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Husky commit-msg 钩子触发               │
│   ↓                                     │
│ Commitlint 校验提交信息格式              │
│   ↓                                     │
│ 格式不对 → 提交被阻止                    │
│ 格式正确 → 提交成功                      │
└─────────────────────────────────────────┘
```

---

## 二、安装依赖

项目中已经安装好了所有依赖。如果需要在新项目中重新安装，执行以下命令：

```bash
# ESLint 相关（eslint、eslint-plugin-vue、@typescript-eslint/* 项目已有）
npm install -D eslint eslint-plugin-vue @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Prettier 及与 ESLint 的桥梁插件
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

# Husky + lint-staged
npm install -D husky lint-staged

# Commitlint（提交信息校验）
npm install -D @commitlint/cli @commitlint/config-conventional
```

---

## 三、ESLint 配置详解

### 3.1 配置文件 `.eslintrc.cjs`

```javascript
module.exports = {
  root: true,           // 标记为根配置，不再向上层目录查找
  env: {
    browser: true,      // 支持浏览器全局变量（window、document 等）
    es2021: true,       // 支持 ES2021 语法
    node: true,         // 支持 Node.js 全局变量（process、__dirname 等）
  },
  extends: [
    'eslint:recommended',           // ESLint 官方推荐规则
    'plugin:vue/vue3-recommended',  // Vue 3 官方推荐规则
    'plugin:@typescript-eslint/recommended', // TypeScript 推荐规则
    'prettier',                     // ⚠️ 必须放最后！关闭与 Prettier 冲突的 ESLint 规则
  ],
  parser: 'vue-eslint-parser',     // Vue 文件使用 vue-eslint-parser
  parserOptions: {
    parser: '@typescript-eslint/parser',  // <script> 内部使用 TS parser
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // ... 具体规则见下方
  },
  ignorePatterns: ['dist', 'node_modules', '*.d.ts', 'vite.config.ts', 'public', 'coverage'],
}
```

**`extends` 的加载顺序很重要：**

1. `eslint:recommended` → 基础规则
2. `plugin:vue/vue3-recommended` → Vue 规则（可能覆盖部分基础规则）
3. `plugin:@typescript-eslint/recommended` → TS 规则
4. `prettier` → **必须最后**，它会关闭所有与 Prettier 格式冲突的 ESLint 规则

### 3.2 忽略文件 `.eslintignore`

```
dist              # 构建产物
node_modules      # 依赖包
public            # 静态资源
coverage          # 测试覆盖率报告
*.d.ts            # 类型声明文件
src/types/auto-imports.d.ts   # 自动生成的类型文件
src/types/components.d.ts     # 自动生成的组件类型
```

### 3.3 规则详解

每条规则的值含义：
- `off` 或 `0` → 关闭该规则
- `warn` 或 `1` → 警告（不影响退出码，CI 不会失败）
- `error` 或 `2` → 错误（退出码为 1，CI 会失败）

#### Vue 相关规则

```javascript
// 关闭强制组件名多词（如 MyComponent），单文件组件常用单名
'vue/multi-word-component-names': 'off',

// 组件属性按推荐顺序排列（warn 级别）
'vue/order-in-components': 'warn',

// 组件内标签顺序：template → script → style
'vue/component-tags-order': ['warn', { order: ['template', 'script', 'style'] }],

// 允许使用 v-html（Element Plus 场景常用）
'vue/no-v-html': 'off',
```

#### TypeScript 相关规则

```javascript
// any 类型警告（建议逐步消除 any，但不阻断开发）
'@typescript-eslint/no-explicit-any': 'warn',

// 未使用变量警告，但允许 _ 前缀的变量不报警
// 例如：const _unused = something 不会警告
'@typescript-eslint/no-unused-vars': ['warn', {
  argsIgnorePattern: '^_',    // 函数参数以 _ 开头不警告
  varsIgnorePattern: '^_',    // 变量以 _ 开头不警告
}],

// 允许 require 导入（兼容 CommonJS 库）
'@typescript-eslint/no-var-requires': 'off',

// 空函数警告（不报错，但提示你可能是忘了写逻辑）
'@typescript-eslint/no-empty-function': 'warn',

// 允许 @ts-ignore（有时候确实需要绕过 TS 检查）
'@typescript-eslint/ban-ts-comment': 'off',
```

#### 通用规则

```javascript
// 生产环境禁止 console.log（开发时不限制）
'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

// 生产环境禁止 debugger
'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

// 优先使用 const（变量不重新赋值时应用 const）
'prefer-const': 'warn',

// 关闭原生 no-unused-vars（用 @typescript-eslint 版本替代）
'no-unused-vars': 'off',
```

### 3.4 如何自定义规则

**场景一：临时在某一行关闭规则**

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData()

/* eslint-disable @typescript-eslint/no-explicit-any */
// 这个区域内 any 不会报警
const a: any = 1
const b: any = 2
/* eslint-enable @typescript-eslint/no-explicit-any */
```

**场景二：修改某个规则的级别**

在 `.eslintrc.cjs` 的 `rules` 中修改：

```javascript
rules: {
  // 把 any 从 warn 改为 error（严格模式）
  '@typescript-eslint/no-explicit-any': 'error',

  // 完全关闭某个规则
  'vue/multi-word-component-names': 'off',

  // 带选项的规则
  '@typescript-eslint/no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
    destructuredArrayIgnorePattern: '^_',
  }],
}
```

**场景三：对特定文件目录使用不同规则**

在 `.eslintrc.cjs` 中添加 `overrides`：

```javascript
module.exports = {
  // ... 基础配置
  overrides: [
    {
      // 仅对测试文件放宽规则
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    {
      // 对 API 目录放宽 any 限制
      files: ['src/api/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
}
```

---

## 四、Prettier 配置详解

### 4.1 配置文件 `.prettierrc.cjs`

```javascript
module.exports = {
  printWidth: 100,          // 每行最大字符数 100
  tabWidth: 2,              // 缩进 2 个空格
  useTabs: false,           // 不用 Tab 缩进
  semi: false,              // 语句末尾不加 semicolon
  singleQuote: true,        // 使用单引号 'xxx' 而非双引号 "xxx"
  quoteProps: 'as-needed',  // 对象属性引号：仅在需要时添加
  jsxSingleQuote: false,    // JSX 中使用双引号
  trailingComma: 'all',     // 多行时在末尾加逗号（对象、数组、参数等）
  bracketSpacing: true,     // 对象花括号内加空格 { foo: bar }
  bracketSameLine: false,   // JSX 标签 > 换行
  arrowParens: 'always',    // 箭头函数参数始终加括号 (x) => x
  endOfLine: 'auto',        // 换行符自动适配系统
  htmlWhitespaceSensitivity: 'ignore',  // HTML 空格不敏感
  vueIndentScriptAndStyle: false,       // Vue 文件 script/style 内代码不额外缩进
}
```

**各选项对比示例：**

```javascript
// semi: true                    // semi: false
const name = 'hello';           const name = 'hello'

// singleQuote: false            // singleQuote: true
const str = "hello world"       const str = 'hello world'

// trailingComma: 'none'         // trailingComma: 'all'
const obj = {                   const obj = {
  a: 1,                           a: 1,
  b: 2                            b: 2,
}                               }

// arrowParens: 'avoid'          // arrowParens: 'always'
x => x + 1                      (x) => x + 1

// bracketSpacing: true          // bracketSpacing: false
{ foo: bar }                    {foo: bar}

// printWidth: 80                // printWidth: 100
const result = someFunction(    const result = someFunction(arg1, arg2, arg3, arg4)
  arg1, arg2, arg3, arg4
)
```

### 4.2 忽略文件 `.prettierignore`

```
dist              # 构建产物不格式化
node_modules      # 依赖包不格式化
public            # 静态资源
coverage          # 测试覆盖率
*.md              # Markdown 文件不格式化（避免破坏手写格式）
*.svg             # SVG 不格式化
*.png, *.jpg ...  # 图片文件
package-lock.json # 锁文件
pnpm-lock.yaml
yarn.lock
```

### 4.3 ESLint 与 Prettier 共存

这两个工具可能产生冲突（比如 ESLint 要求加分号，Prettier 去掉分号）。解决方案：

1. **`eslint-config-prettier`**：关闭所有与 Prettier 冲突的 ESLint 规则
2. **`eslint-plugin-prettier`**：将 Prettier 的格式化问题作为 ESLint 错误报告

在 `.eslintrc.cjs` 中：

```javascript
extends: [
  // ...其他配置
  'prettier',  // ← 必须在最后
],
```

这样 **ESLint 只管代码质量**（有没有 bug、最佳实践），**Prettier 只管代码风格**（缩进、引号、换行），职责清晰不冲突。

---

## 五、Husky 配置详解

### 5.1 Husky 是什么

Husky 是一个 Git 钩子（Git Hooks）管理工具。Git 在某些操作（如 commit、push）时会触发钩子脚本，Husky 让你方便地配置这些钩子。

**没有 Husky 时：** 开发者可以不格式化代码、不写规范的提交信息就提交。

**有 Husky 后：** 每次 `git commit` 时自动执行代码检查和格式校验，不符合规范的提交会被阻止。

### 5.2 初始化 Husky

**首次初始化：**

```bash
# 安装 husky
npm install -D husky

# 初始化 husky（会在项目根目录创建 .husky 目录）
npx husky
```

**`package.json` 中的 prepare 脚本：**

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

`prepare` 是 npm 的生命周期脚本，在 `npm install` 完成后自动执行。这意味着：
- 团队成员 clone 项目后执行 `npm install`，Husky 会自动初始化
- 不需要手动告诉每个人 "记得运行 husky 命令"

### 5.3 pre-commit 钩子

文件：`.husky/pre-commit`

```bash
npx lint-staged
```

**执行时机：** 每次执行 `git commit` 时，在实际创建 commit 之前触发。

**作用：** 调用 `lint-staged`，对暂存区的文件执行 ESLint 和 Prettier。如果有错误，提交会被阻止。

### 5.4 commit-msg 钩子

文件：`.husky/commit-msg`

```bash
npx --no -- commitlint --edit "$1"
```

**执行时机：** 在 commit message 写好后、commit 创建前触发。

**作用：** 校验提交信息是否符合 Conventional Commits 规范（如 `feat: 新增登录功能`）。格式不对则阻止提交。

### 5.5 如何添加新的钩子

**添加 pre-push 钩子（push 前运行测试）：**

```bash
# 方式一：手动创建文件
# 在 .husky/ 下创建 pre-push 文件，内容如下：
npx vitest run

# 方式二：使用 husky 命令
npx husky add .husky/pre-push "npx vitest run"
```

**可用的 Git 钩子列表：**

| 钩子名 | 触发时机 | 常用场景 |
|--------|----------|----------|
| `pre-commit` | commit 之前 | 代码检查、格式化 |
| `commit-msg` | 校验 commit message | 提交信息规范检查 |
| `pre-push` | push 之前 | 运行测试、类型检查 |
| `post-merge` | merge 之后 | 自动安装依赖 |
| `pre-rebase` | rebase 之前 | 检查是否有未提交的更改 |

---

## 六、lint-staged 配置详解

`lint-staged` 的配置在 `package.json` 中：

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,scss,md,html}": [
      "prettier --write"
    ]
  }
}
```

**工作原理：**

1. 你执行 `git add .` 将文件加入暂存区
2. 你执行 `git commit`，Husky 触发 pre-commit 钩子
3. lint-staged 获取所有暂存的文件
4. 根据文件扩展名匹配对应命令：
   - `.ts` / `.vue` / `.js` 文件 → 先 `eslint --fix` 修复问题，再 `prettier --write` 格式化
   - `.json` / `.css` / `.md` 文件 → 仅 `prettier --write` 格式化
5. 如果命令执行失败（eslint 报 error），提交被阻止

**为什么不直接对整个项目运行 lint？**

- **效率：** 只检查你修改过的文件，不浪费时间在没改的文件上
- **渐进式：** 老项目可能有很多历史 lint 问题，lint-staged 只关注新改动

**自定义 lint-staged 配置示例：**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --fix --cache",
      "prettier --write"
    ],
    "*.{json,css,scss,md,html}": [
      "prettier --write"
    ],
    "*.vue": [
      "eslint --fix"
    ]
  }
}
```

---

## 七、Commitlint 提交规范

### 7.1 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**（必填）：提交类型
- **scope**（可选）：影响范围，如模块名
- **subject**（必填）：简要说明
- **body**（可选）：详细描述
- **footer**（可选）：关联的 issue 等

### 7.2 Type 类型说明

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 新增用户搜索功能` |
| `fix` | 修复 bug | `fix: 修复登录页密码校验错误` |
| `docs` | 文档变更 | `docs: 更新 API 接口文档` |
| `style` | 代码格式调整（不影响逻辑） | `style: 统一缩进为2空格` |
| `refactor` | 重构（非新功能、非修复） | `refactor: 抽取用户权限逻辑为独立模块` |
| `perf` | 性能优化 | `perf: 优化列表渲染性能` |
| `test` | 测试相关 | `test: 添加用户模块单元测试` |
| `build` | 构建系统或外部依赖变更 | `build: 升级 vite 到 5.x` |
| `ci` | CI 配置变更 | `ci: 添加 GitHub Actions 部署` |
| `chore` | 其他杂项 | `chore: 更新 .gitignore` |
| `revert` | 回滚提交 | `revert: 回滚 feat: 新增搜索功能` |

### 7.3 提交示例

**✅ 正确的提交信息：**

```bash
git commit -m "feat: 新增用户管理页面的分页功能"
git commit -m "fix: 修复侧边栏菜单在移动端无法收起的问题"
git commit -m "docs: 补充 Pinia store 使用文档"
git commit -m "refactor: 将 API 请求模块从 axios 封装中拆分"
git commit -m "style: 统一 Vue 文件的模板格式"
git commit -m "chore: 更新依赖版本"
```

**❌ 错误的提交信息（会被 commitlint 阻止）：**

```bash
git commit -m "更新了一些东西"          # 没有 type
git commit -m "fix bug"                # 缺少冒号分隔符
git commit -m "abc: 测试"              # type 不在允许列表中
git commit -m ""                       # 空提交信息
```

**配置文件 `.commitlintrc.cjs`：**

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert',
    ]],
    'type-empty': [2, 'never'],       // type 不能为空
    'subject-empty': [2, 'never'],    // subject 不能为空
    'subject-case': [0],              // 不强制 subject 大小写
    'subject-full-stop': [0],         // 不强制 subject 末尾无句号
  },
}
```

---

## 八、NPM Scripts 命令一览

`package.json` 中配置了以下脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix --cache",
    "lint:check": "eslint . --cache",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint:fix": "eslint . --fix && prettier --write .",
    "test": "vitest",
    "type-check": "vue-tsc --noEmit",
    "prepare": "husky"
  }
}
```

**各命令详解：**

| 命令 | 作用 | 使用场景 |
|------|------|----------|
| `npm run lint` | ESLint 检查 + 自动修复 + 缓存 | 日常开发，提交前修复代码问题 |
| `npm run lint:check` | ESLint 仅检查（不修改文件） | CI 环境，检查是否有 lint 错误 |
| `npm run format` | Prettier 格式化所有文件 | 项目初始化后统一格式化 |
| `npm run format:check` | Prettier 仅检查（不修改文件） | CI 环境，检查格式是否统一 |
| `npm run lint:fix` | ESLint 修复 + Prettier 格式化 | 一键修复所有代码规范和格式问题 |
| `npm run type-check` | TypeScript 类型检查（不生成文件） | 提交前确认类型无误 |

**推荐的工作流：**

```bash
# 1. 开发中：编辑器保存时自动格式化
# 2. 提交前：运行一键修复
npm run lint:fix

# 3. git add & commit（Husky 会自动再检查一次暂存区的文件）
git add .
git commit -m "feat: 新增用户搜索功能"
```

---

## 九、VS Code 编辑器集成

为了在编辑器中实时看到 ESLint 警告并保存时自动格式化，推荐安装以下扩展：

### 必装扩展

1. **ESLint** (`dbaeumer.vscode-eslint`) — 实时显示 ESLint 警告/错误
2. **Prettier - Code formatter** (`esbenp.prettier-vscode`) — 保存时自动格式化

### VS Code 配置

在 `.vscode/settings.json` 中添加（如果没有该文件则创建）：

```json
{
  // 保存时自动格式化
  "editor.formatOnSave": true,
  // 默认使用 Prettier 格式化
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  // Vue 文件使用 Prettier
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  // TypeScript 文件使用 Prettier
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  // JavaScript 文件使用 Prettier
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  // JSON 文件使用 Prettier
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  // CSS/SCSS 文件使用 Prettier
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  // ESLint 自动修复（保存时）
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  // ESLint 支持 Vue 文件
  "eslint.validate": [
    "javascript",
    "typescript",
    "vue"
  ]
}
```

### 推荐扩展

| 扩展名 | 作用 |
|--------|------|
| Vue - Official | Vue 3 语法支持 |
| TypeScript Vue Plugin | TS + Vue 类型支持 |
| Error Lens | 在代码行内直接显示错误信息 |
| GitLens | 查看 git 历史和 blame 信息 |

---

## 十、常见问题与排查

### Q1：`git commit` 时提示 `eslint: command not found`

**原因：** ESLint 没有全局安装，lint-staged 找不到命令。

**解决：** lint-staged 默认会使用 `npx` 执行命令。确保 `package.json` 的 `lint-staged` 配置正确，并且 `node_modules` 已安装：

```bash
npm install
```

### Q2：Husky 钩子没有触发

**排查步骤：**

```bash
# 1. 确认 husky 已初始化
ls .husky/pre-commit   # 文件应该存在

# 2. 确认 git hooks 路径正确
git config core.hooksPath    # 应输出 .husky

# 3. 如果没有设置，手动设置
npx husky

# 4. 确认 pre-commit 文件有执行权限（Windows 下一般不需要）
chmod +x .husky/pre-commit
```

### Q3：ESLint 报 `Parsing error: Cannot find module`

**原因：** 缺少 parser 依赖。

**解决：**

```bash
npm install -D @typescript-eslint/parser vue-eslint-parser
```

### Q4：Prettier 和 ESLint 规则冲突（同一行报相反的规则）

**原因：** `eslint-config-prettier` 没有正确加载。

**解决：** 确认 `.eslintrc.cjs` 的 `extends` 中 `prettier` 在**最后一位**：

```javascript
extends: [
  'eslint:recommended',
  'plugin:vue/vue3-recommended',
  'plugin:@typescript-eslint/recommended',
  'prettier',  // ← 必须是最后一个
],
```

### Q5：提交时 commitlint 报错 `subject must not be empty`

**原因：** commit message 格式不对。

**解决：** 确保使用正确格式：

```bash
# ✅ 正确
git commit -m "feat: 新增功能"

# ❌ 错误（缺少冒号和空格）
git commit -m "feat新增功能"
```

### Q6：想跳过钩子检查（紧急情况）

```bash
# 跳过 pre-commit 和 commit-msg 钩子
git commit -m "chore: 紧急修复" --no-verify
```

⚠️ **注意：** 不建议常规使用，仅作为紧急情况的逃生通道。

### Q7：`lint-staged` 报 `No files match the pattern`

**原因：** 暂存区没有匹配的文件类型。

**解决：** 这是正常行为，lint-staged 在没有匹配文件时不会执行。不需要处理。

### Q8：如何让某些文件永久跳过 ESLint 检查？

在 `.eslintignore` 中添加路径：

```
# 跳过整个目录
src/legacy/

# 跳过特定文件
src/config/constants.ts
```

或者在文件顶部添加：

```javascript
/* eslint-disable */
// 整个文件都不检查
```

---

## 十一、CI/CD 集成建议

在 CI 流水线中加入代码规范检查：

### GitHub Actions 示例

```yaml
name: Lint Check

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      # ESLint 检查（不修复，只报告）
      - run: npm run lint:check

      # Prettier 格式检查
      - run: npm run format:check

      # TypeScript 类型检查
      - run: npm run type-check
```

### 检查策略

| 阶段 | 命令 | 失败策略 |
|------|------|----------|
| PR 创建时 | `lint:check` + `format:check` | 不通过则阻止合并 |
| 合并到 main | `lint:check` + `type-check` + `test` | 不通过则阻止部署 |
| 定时（每日） | 全量 `lint` + `format` | 生成报告供团队审查 |

---

## 项目文件清单

以下是本次配置新增/修改的所有文件：

```
g:\code\vite\
├── .eslintrc.cjs          # ESLint 配置
├── .eslintignore          # ESLint 忽略规则
├── .prettierrc.cjs        # Prettier 配置
├── .prettierignore        # Prettier 忽略规则
├── .commitlintrc.cjs      # Commitlint 提交规范配置
├── .gitignore             # Git 忽略规则（新增 .eslintcache、.husky/_）
├── .husky/
│   ├── pre-commit         # 提交前钩子：运行 lint-staged
│   └── commit-msg         # 提交信息钩子：运行 commitlint
└── package.json           # 新增依赖和 scripts
```

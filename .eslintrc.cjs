/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // 必须放在最后，关闭与 Prettier 冲突的规则
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  // 解决路径别名 @ -> src 的导入解析
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.js', '.vue', '.json'],
      },
    },
  },
  rules: {
    // ======================== Vue 相关 ========================
    // 关闭强制组件名多词要求（单文件组件经常只有一个词）
    'vue/multi-word-component-names': 'off',
    // 允许在 <script setup> 中使用 defineProps 等宏
    'vue/no-setup-props-destructure': 'off',
    // 组件属性顺序（按官方推荐）
    'vue/order-in-components': 'warn',
    // 组件标签顺序
    'vue/component-tags-order': ['warn', { order: ['template', 'script', 'style'] }],

    // ======================== TypeScript 相关 ========================
    // 允许使用 any（建议逐步关闭）
    '@typescript-eslint/no-explicit-any': 'warn',
    // 允许未使用的变量以 _ 开头
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // 允许 require 导入（兼容一些 CommonJS 库）
    '@typescript-eslint/no-var-requires': 'off',
    // 允许空函数（如占位）
    '@typescript-eslint/no-empty-function': 'warn',
    // 关闭对 @ts-ignore 的禁止（有时确实需要）
    '@typescript-eslint/ban-ts-comment': 'off',

    // ======================== 通用规则 ========================
    // 禁止 console.log（warn 级别，方便调试时提醒）
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 禁止 debugger
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 优先使用 const
    'prefer-const': 'warn',
    // 禁止未使用的变量
    'no-unused-vars': 'off', // 使用 @typescript-eslint 版本替代
    // 允许使用 v-html（Element Plus 中常用）
    'vue/no-v-html': 'off',
  },
  // 忽略不需要检查的文件/目录
  ignorePatterns: ['dist', 'node_modules', '*.d.ts', 'vite.config.ts', 'public', 'coverage'],
}

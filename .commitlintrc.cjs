module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type 类型（不强制小写，但建议小写）
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档变更
        'style', // 代码格式（不影响逻辑）
        'refactor', // 重构（非新功能、非修复）
        'perf', // 性能优化
        'test', // 测试相关
        'build', // 构建系统或外部依赖变更
        'ci', // CI 配置变更
        'chore', // 其他杂项
        'revert', // 回滚提交
      ],
    ],
    // type 不能为空
    'type-empty': [2, 'never'],
    // subject（提交说明）不能为空
    'subject-empty': [2, 'never'],
    // 不强制 subject 大小写
    'subject-case': [0],
    // 不强制 subject 末尾不加句号（中文习惯）
    'subject-full-stop': [0],
  },
}

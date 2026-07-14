/**
 * Mock 流式响应数据池 - 用于开发演示和验证 UI
 *
 * 设计原则：
 * - 按小片段拆分成 chunks，模拟真实流的增量读取速度
 * - 每个 chunk 对应一次渲染更新（打字机效果）
 */

// ==================== Default 通用回复 ====================

export const DEFAULT_CHUNKS = [
  '这是一个很有趣的',
  '问题！从技',
  '术角度看',
  '度，这个功能可以实',
  '现。建议你先明确具体需求，',
  '然后我们可以一步步实现。',
]

// ==================== Code 代码块回复 ====================

export const CODE_CHUNKS = [
  '这里有一段示例代码：',
  '',
  '```',
  '// Vue + TypeScript 组件示例',
  'interface User {',
  '  id: number,',
  '  name: string,',
  '  email: string',
  '}',
  '',
  'const user = {',
  '  id: 1,',
  "  name: '张三',",
  "  email: 'zhangsan@example.com'",
]

// ==================== Markdown 富文本回复 ====================

export const MARKDOWN_CHUNKS = [
  '## Markdown 语法说明',
  '',
  '### 标题',
  '- H1 # 标题',
  '- H2 ## 标题',
  '- H3 ### 标题',
  '',
  '### 列表',
  '**无序列表**：',
  '- Apple',
  '- Banana',
  '- Orange',
  '',
  '### 引用',
  '> 这是一段引用文字',
  '> 可以表达重要信息',
]

// ==================== Mermaid 图表演示 ====================

export const MERMAID_EXAMPLE = `graph TD;
    A[开始] --> B{判断};
    B -->|是 | C[执行];
    B -->|否 | D[等待输入];
    D --> B;`

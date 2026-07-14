import { defineStore } from 'pinia'

// ==================== 流式响应格式定义 ====================

/** SSE Stream Chunk - 流式响应的基本单元 */
export interface ChatStreamChunk {
  /** 增量内容块（可能是完整消息或片段） */
  content: string
  /** 消息角色：assistant | user | system */
  role: 'assistant' | 'user' | 'system'
  /** 是否已完成生成 */
  done: boolean
  /** SSE 的 [data:] 前缀标记（可选） */
  data?: string
}

/** 流式响应事件类型 */
export type StreamEvent =
  | { type: 'delta'; chunk: ChatStreamChunk }
  | { type: 'done'; done: boolean }
  | { type: 'error'; error: string }

// ==================== Mock Stream (本地开发/演示) ====================

/** Mock 响应数据池 */
export const MOCK_RESPONSES = [
  '这是一个很有趣的问题！从技术角度来看，这个功能可以实现。建议你先明确具体需求，然后我们可以一步步实现。',
  '好的，我理解你的意思了。关于这个问题，有几个方面需要考虑：第一是性能优化，第二是用户体验。',
  '根据你的描述，我建议采用组件化开发方式。这样可以让代码更清晰、更易维护。你可以参考项目中的其他页面结构。',
  '这是一个很好的想法！在实际项目中，我们可以用这种方式实现。记得要在权限控制上做相应配置哦~',
  '这个技术方案是可行的。建议你先做好技术调研，评估各种方案的优缺点，然后选择一个最合适的方案。',
]

/** Mock Code 响应 */
export const MOCK_CODE_RESPONSE = `test`

/** Mock Stream - 模拟真实的流式响应 */
export class MockStream {
  private currentResponse: string = ''
  private speed: number = 30 // 每个字符延迟 (ms)

  constructor(
    type: 'default' | 'code' | 'markdown',
    private chunkSize: number = 3,
  ) {
    if (type === 'code') {
      this.currentResponse = MOCK_CODE_RESPONSE
    } else if (type === 'markdown') {
      this.currentResponse = MOCK_CODE_RESPONSE // 暂未定义 Markdown mock，先用 code 代替
    } else {
      const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length)
      this.currentResponse = MOCK_RESPONSES[randomIndex]
    }
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<ChatStreamChunk> {
    // 增量读取响应
    for (let i = 0; i < this.currentResponse.length; i += this.chunkSize) {
      const chunk = this.currentResponse.slice(i, i + this.chunkSize)
      if (chunk) {
        yield {
          content: chunk,
          role: 'assistant',
          done: false,
          data: chunk,
        }
      }
      // 模拟网络延迟（真实 SSE 由服务器控制）
      await new Promise((resolve) => setTimeout(resolve, this.speed))
    }

    // 完成标志
    yield {
      content: '',
      role: 'assistant',
      done: true,
      data: undefined,
    }
  }
}

// ==================== Chat Store ====================

/** 聊天会话接口 */
export interface ChatSession {
  id: string
  question: string
  answers: Array<{ timestamp: number; content: string }>
}

export enum ModelProvider {
  DEFAULT = 'default',
  CLAUDE = 'claude',
  GPT = 'gpt',
  OLLAMA = 'ollama',
}

export const useChatStore = defineStore('chat', () => {
  // 状态初始化
  const sessions = ref<ChatSession[]>([])
  const isThinking = ref(false)
  const loadingProgress = ref(0)
  const history = ref<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const input = ref('')
  const model = ref<ModelProvider>(ModelProvider.DEFAULT)

  // 派生状态
  const currentSession = computed(() => sessions.value[sessions.value.length - 1])

  /** 初始化第一个会话 */
  const initSession = () => {
    if (sessions.value.length === 0) {
      sessions.value.push({
        id: Date.now().toString(),
        question: '',
        answers: [],
      })
    }
  }

  /** 创建新的流式响应生成器 */
  const createStream = async (
    type: 'default' | 'code' | 'markdown',
  ): Promise<AsyncGenerator<ChatStreamChunk, void, unknown>> => {
    // 真实项目：此处应返回实际的 SSE fetch 生成器
    // 例如：
    // const response = await axios.post('/api/chat/stream', { message: input.value }, { responseType: 'stream' })
    // const reader = response.data.pipeThrough(new ReadableStreamReader())

    // 暂时使用 Mock Stream（开发友好）
    return new MockStream(type)[Symbol.asyncIterator]()
  }

  /** 获取当前模型 */
  const getCurrentModel = (): ModelProvider => model.value

  /** 切换模型 */
  const setModel = (newModel: ModelProvider) => {
    model.value = newModel
  }

  /** 清空历史 */
  const clearHistory = () => {
    history.value = []
    sessions.value = []
    isThinking.value = false
    loadingProgress.value = 0
  }

  return {
    sessions,
    isThinking,
    loadingProgress,
    history,
    input,
    model,
    currentSession,
    initSession,
    createStream,
    getCurrentModel,
    setModel,
    clearHistory,
  }
})

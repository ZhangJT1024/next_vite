import type { ChatStreamChunk } from '../business/chat'
import * as MOCK_DATA from '../business/mock-data'

/**
 * 模型适配器 - 统一不同大模型的响应格式
 *
 * 设计原则：
 * - 将模型特有的流式协议和 UI 渲染解耦
 * - 先把不同模型的增量响应归一化为文本块，再交给界面展示
 */

// ==================== 真实模型 API 定义 ====================

/** Claude (Anthropic) API 响应格式 */
interface ClaudeStreamResponse {
  type: 'stream'
  data: Array<{
    type?: string
    delta?: { role?: string; content?: Array<{ type: 'text'; text: string }> }
    done?: boolean
  }>
}

/** OpenAI / GPT API 响应格式 */
interface OpenAIStreamResponse {
  id: string
  object: 'chat.completion.chunk'
  choices: Array<{
    delta: { role?: string; content?: string }
    finish_reason?: string
  }>
  [key: string]: unknown
}

/** Ollama API 响应格式 */
interface OllamaStreamResponse {
  model: string
  response: string
  done: boolean
}

// ==================== 适配器工厂 ====================

/**
 * 模型适配器工厂 - 创建对应模型的流式处理管道
 */
export class ModelAdapterFactory {
  /**
   * 创建 Claude 响应适配器
   */
  static createClaudeAdapter(): Adapter<ClaudeStreamResponse> {
    return new ClaudeAdapter()
  }

  /**
   * 创建 OpenAI/GPT 响应适配器
   */
  static createOpenAIAdapter(): Adapter<OpenAIStreamResponse> {
    return new OpenAIAdapter()
  }

  /**
   * 创建 Ollama 响应适配器
   */
  static createOllamaAdapter(): Adapter<OllamaStreamResponse> {
    return new OllamaAdapter()
  }

  /**
   * 创建 Mock 适配器（开发演示用）
   */
  static createMockAdapter(type: 'default' | 'code' | 'markdown'): Adapter<ChatStreamChunk> {
    // TODO: 导入 MockStream 或返回 MockData
    return new MockAdapter(type)
  }
}

// ==================== 适配器基类 ====================

/** 模型响应适配器接口 */
export interface Adapter<_TResponse = unknown> {
  /**
   * 将原始响应转换为统一的流式增量格式
   * @param response - 原始响应 Stream / ReadableStream
   * @returns 归一化的流式生成器
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process(response: any): AsyncGenerator<ChatStreamChunk, void, unknown>

  /** 获取适配器类型标识 */
  getType(): string
}

// ==================== Claude 适配器 ====================

class ClaudeAdapter implements Adapter<ClaudeStreamResponse> {
  getType(): string {
    return 'claude'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async *process(response: any): AsyncGenerator<ChatStreamChunk, void, unknown> {
    const reader = response.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const data = JSON.parse(value) as ClaudeStreamResponse['data'][0]

        // Claude 使用 content[].text 数组形式，需要拼接
        if (data.delta?.content) {
          const textArray = data.delta.content as Array<{ type: 'text'; text: string }>
          let accumulatedText = ''

          for (const item of textArray) {
            accumulatedText += item.text
          }

          if (accumulatedText) {
            yield {
              content: accumulatedText,
              role: data.delta.role || 'assistant',
              done: false,
              data: accumulatedText,
            }
          }
        }
      }

      yield {
        content: '',
        role: 'assistant',
        done: true,
        data: null,
      }
    } catch (error) {
      console.error('Claude 解析错误:', error)
      throw error
    } finally {
      reader.releaseLock()
    }
  }
}

// ==================== OpenAI 适配器 ====================

class OpenAIAdapter implements Adapter<OpenAIStreamResponse> {
  getType(): string {
    return 'openai'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async *process(response: any): AsyncGenerator<ChatStreamChunk, void, unknown> {
    const reader = response.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const data = JSON.parse(value) as OpenAIStreamResponse

        // 只处理 role 为 assistant 的增量内容
        if (data.choices?.[0]?.delta?.content) {
          const content = data.choices[0].delta.content

          yield {
            content,
            role: data.choices[0].delta.role || 'assistant',
            done: !!data.choices[0].finish_reason,
            data: content,
          }
        }
      }

      yield {
        content: '',
        role: 'assistant',
        done: true,
        data: null,
      }
    } catch (error) {
      console.error('OpenAI 解析错误:', error)
      throw error
    } finally {
      reader.releaseLock()
    }
  }
}

// ==================== Ollama 适配器 ====================

class OllamaAdapter implements Adapter<OllamaStreamResponse> {
  getType(): string {
    return 'ollama'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async *process(response: any): AsyncGenerator<ChatStreamChunk, void, unknown> {
    const reader = response.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const data = JSON.parse(value) as OllamaStreamResponse

        // Ollama 的 response 已经是完整文本，需要增量化处理
        if (data.response && !data.done) {
          // Ollama 每次返回的是累积响应，需要提取增量部分
          yield {
            content: data.response,
            role: 'assistant',
            done: false,
            data: data.response,
          }
        }
      }

      yield {
        content: '',
        role: 'assistant',
        done: true,
        data: null,
      }
    } catch (error) {
      console.error('Ollama 解析错误:', error)
      throw error
    } finally {
      reader.releaseLock()
    }
  }
}

// ==================== Mock 适配器（增量读取） ====================

class MockAdapter implements Adapter<ChatStreamChunk> {
  private chunks: string[] = []
  private currentIndex = 0
  private speed: number = 30

  constructor(private type: 'default' | 'code' | 'markdown') {
    if (type === 'code') {
      this.chunks = MOCK_DATA.CODE_CHUNKS
    } else if (type === 'markdown') {
      this.chunks = MOCK_DATA.MARKDOWN_CHUNKS
    } else {
      this.chunks = MOCK_DATA.DEFAULT_CHUNKS
    }
  }

  getType(): string {
    return 'mock'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async *process(_response: any): AsyncGenerator<ChatStreamChunk, void, unknown> {
    // Mock 模式：按小片段增量读取，模拟真实流式体验
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i]

      yield {
        content: chunk,
        role: 'assistant',
        done: false,
        data: chunk,
      }

      // 模拟网络延迟（真实 SSE 由服务器控制）
      await new Promise((resolve) => setTimeout(resolve, this.speed))
    }

    yield {
      content: '',
      role: 'assistant',
      done: true,
      data: null,
    }
  }
}

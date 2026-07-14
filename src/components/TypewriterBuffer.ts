/**
 * 打字机缓冲区 - 将网络读取速度和视觉输出速度分离
 *
 * 设计原则：
 * - 接收原始流式响应，按固定节奏吐出文本块
 * - UI 只需监听 buffer 变化即可，无需关心底层协议细节
 */

export interface ITypewriterBuffer {
  /** 当前完整文本 */
  readonly text: string
  /** 是否已完成生成 */
  readonly done: boolean
  /** 显示进度 (0-100) */
  readonly progress: number
  /** 监听文本变化 */
  onTextUpdate(callback: (text: string, done: boolean) => void): () => void
}

/**
 * 打字机缓冲区实现
 *
 * 使用场景：
 * - 接收模型增量流，控制 UI 渲染节奏
 * - 将快速的数据流转化为平滑的视觉输出
 */
export class TypewriterBuffer {
  private buffer: string = ''
  private speed: number = 30 // 每帧延迟 ms
  private readonly chunkSize: number = 2 // 每批增量字节数
  private readonly maxProgress = 100
  private timerId: ReturnType<typeof setTimeout> | null = null
  private bytesRead = 0

  constructor(
    private stream: AsyncIterable<string>,
    private onComplete?: () => void,
  ) {
    this.processStream()
  }

  /**
   * 启动流式处理
   */
  private async processStream(): Promise<void> {
    let accumulated = ''
    let done = false

    try {
      const streamReader = this.stream as AsyncGenerator<string, void, unknown>

      while (!done) {
        const chunk = await streamReader.next()

        if (chunk.done) {
          done = true
          break
        }

        accumulated += chunk.value
        this.bytesRead += chunk.value.length

        this.buffer = accumulated

        if (accumulated.length > 100) {
          // 超过阈值后加快节奏（避免 UI 卡顿）
          this.speed = Math.max(10, this.speed * 0.8)
        }

        // 触发更新回调
        this.notifyUpdate()

        // 等待下一帧
        await new Promise((resolve) => setTimeout(resolve, this.speed))
      }

      // 完成处理
      if (this.onComplete) {
        this.onComplete()
      }
    } catch (error) {
      console.error('Typewriter error:', error)
      throw error
    } finally {
      this.stopTimer()
    }
  }

  /**
   * 通知 UI 更新
   */
  private notifyUpdate(): void {
    const progress = Math.min(100, (this.bytesRead / 100) * this.maxProgress)
    this.emitUpdate(this.buffer, progress < 100)
  }

  /**
   * 触发更新事件（由 TypewriterEventBus 统一管理）
   */
  private emitUpdate(text: string, isStreaming: boolean): void {
    // 注册到全局事件总线，供组件订阅
    // TODO: 使用 Vue 的事件总线替代 window 上的全局变量
    const bus = (window as Record<string, unknown>).typewriterEventBus as {
      emit?: (event: string, data: unknown) => void
    }
    if (bus?.emit) {
      bus.emit('text-update', {
        text,
        progress: Math.min(100, (this.buffer.length / 100) * this.maxProgress),
        done: !isStreaming,
      })
    }
  }

  /**
   * 停止定时器
   */
  private stopTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
  }

  /**
   * 获取当前文本
   */
  getText(): string {
    return this.buffer
  }

  /**
   * 获取进度
   */
  getProgress(): number {
    return Math.min(100, (this.buffer.length / 20) * 100)
  }

  /**
   * 判断是否完成
   */
  isDone(): boolean {
    return !this.buffer || this.getProgress() >= 100
  }

  /**
   * 重置缓冲区
   */
  reset(): void {
    this.buffer = ''
    this.bytesRead = 0
    this.speed = 30
    this.onComplete?.()
  }
}

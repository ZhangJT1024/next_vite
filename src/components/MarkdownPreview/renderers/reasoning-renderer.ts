/**
 * 推理块（Reasoning Block）渲染器
 *
 * 设计模式：将模型思考过程与最终回答分离展示
 *
 * 使用场景：
 * - 展示模型的思维链（Chain of Thought）
 * - 逐步推导问题的解决方案
 * - 调试和解释复杂问题
 */

export interface ReasoningBlock {
  /** 推理内容 */
  content: string
  /** 推理类型标识 */
  type?: 'thought' | 'planning' | 'evaluating' | 'concluding' | string
  /** 是否隐藏（用户手动展开/收起） */
  hidden?: boolean
}

/**
 * Reasoning Block 样式配置
 */
export interface ReasoningBlockStyle {
  backgroundColor: string
  borderColor: string
  textColor: string
  icon?: string
}

// 预设样式主题
export const REASONING_STYLES: Record<string, ReasoningBlockStyle> = {
  thought: {
    backgroundColor: '#fffbe6',
    borderColor: '#ffe58f',
    textColor: '#d46b08',
  },
  planning: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae7fd',
    textColor: '#026aaa',
  },
  evaluating: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
    textColor: '#146b3a',
  },
  concluding: {
    backgroundColor: '#fef2f2',
    borderColor: '#fed7d7',
    textColor: '#991b1b',
  },
}

/**
 * Reasoning Block 渲染器 - 将推理块转换为 Markdown 语法标记
 */
export class ReasoningBlockRenderer {
  private readonly marker = '<reasoning>' // 推理块的 Markdown 分隔符

  /**
   * 检测文本中是否包含推理块标记
   */
  detectReasoningBlocks(text: string): boolean {
    return text.includes(this.marker)
  }

  /**
   * 提取所有推理块及其内容
   */
  extractReasoningBlocks(text: string): ReasoningBlock[] {
    const regex = new RegExp(`<reasoning[^>]*>([\\s\\S]*?)</reasoning>`, 'gi')

    const results: ReasoningBlock[] = []
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0]

      // 提取推理类型和内容
      const typeMatch = fullMatch.match(/data-type="([^"]*)"/)
      const type = typeMatch ? typeMatch[1] : 'thought'

      const rawContent = match[1]?.trim() || ''

      results.push({
        content: rawContent,
        type,
        hidden: false,
      })
    }

    return results
  }

  /**
   * 将推理块转换为可渲染的格式（保留 Markdown 标记用于后续处理）
   */
  formatForRendering(text: string): {
    plainText: string
    reasoningBlocks: ReasoningBlock[]
    finalContent: string
  } {
    const blocks = this.extractReasoningBlocks(text)

    // 移除标记，替换为占位符
    const formatted = text.replace(
      /<reasoning[^>]*>([\s\S]*?)<\/reasoning>/gi,
      (_match, content) => {
        return `[${this.marker}${content.replace(/[\n\r]/g, '')}]`
      },
    )

    return {
      plainText: text, // 原始文本（用于最终展示）
      reasoningBlocks: blocks,
      finalContent: formatted,
    }
  }

  /**
   * 渲染推理块到 DOM 元素（Vue SSR/SSG 兼容）
   */
  async renderToElement(element: HTMLElement, text: string): Promise<void> {
    const result = this.formatForRendering(text)

    // 插入推理块容器
    for (const block of result.reasoningBlocks) {
      const div = document.createElement('div')
      div.className = 'reasoning-block'

      // 设置样式主题
      const style = REASONING_STYLES[block.type as string] || REASONING_STYLES.thought
      div.style.cssText = `
        background-color: ${style.backgroundColor};
        border-left: 4px solid ${style.borderColor};
        color: ${style.textColor};
        padding: 12px 16px;
        margin: 8px 0;
        border-radius: 4px;
      `

      // 推理类型图标
      const icon = this.getIconForType(block.type || 'thought')

      div.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="font-size: 16px; margin-top: 2px;">${icon}</span>
          <div style="flex: 1;">
            <strong style="font-size: 12px; opacity: 0.8;">${this.getTypeLabel(block.type || 'thought')}</strong>
            <div style="margin-top: 4px; white-space: pre-wrap;">${block.content}</div>
          </div>
        </div>
      `

      element.insertBefore(div, element.firstChild)
    }

    // 剩余内容（如果有）
    if (result.finalContent.trim()) {
      const contentDiv = document.createElement('div')
      contentDiv.className = 'reasoning-content'
      contentDiv.innerHTML = result.finalContent
      element.appendChild(contentDiv)
    }
  }

  /**
   * 获取推理类型对应的图标
   */
  private getIconForType(type: string): string {
    const icons: Record<string, string> = {
      thought: '💭',
      planning: '📋',
      evaluating: '⚖️',
      concluding: '✅',
    }

    return icons[type.toLowerCase()] || '🧠'
  }

  /**
   * 获取推理类型标签（用于显示）
   */
  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      thought: '思考',
      planning: '规划',
      evaluating: '评估',
      concluding: '结论',
    }

    return labels[type.toLowerCase()] || type.toUpperCase()
  }
}

/**
 * Mermaid 图表渲染器
 *
 * 支持流程图、序列图、思维导图等
 */
declare global {
  interface Window {
    mermaid?: {
      initialize: (config: Record<string, unknown>) => void
      run: (options: {
        elements: HTMLElement[]
        suppressErrors?: boolean
      }) => Promise<Record<string, unknown>>
    }
  }
}

export class MermaidRenderer {
  private mermaidInitialized = false
  private readonly renderTimeout = 50

  /**
   * 初始化 Mermaid（延迟加载）
   */
  async init(): Promise<void> {
    if (this.mermaidInitialized || window.mermaid) {
      this.mermaidInitialized = true
      return
    }

    // 动态加载 Mermaid
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js'

    script.onload = () => {
      this.mermaidInitialized = true
      window.mermaid?.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      })
      console.log('Mermaid loaded')
    }

    document.head.appendChild(script)
  }

  /**
   * 渲染单个 Mermaid 图表
   */
  async render(element: HTMLElement): Promise<void> {
    const graph = element.getAttribute('data-mermaid-code')
    if (!graph || !this.mermaidInitialized || !window.mermaid) {
      console.warn('Mermaid not available or no code provided')
      return
    }

    try {
      // 延迟渲染避免闪烁
      await new Promise((resolve) => setTimeout(resolve, this.renderTimeout))

      // 清除可能的错误提示
      element.classList.remove('mermaid-error')

      const result = await window.mermaid.run({
        elements: [element],
        suppressErrors: true,
      })

      // 替换为 SVG（保留原始元素用于响应式更新）
      const svgContent =
        typeof result === 'object' ? (result as Record<string, unknown>)['element'] : null
      if (svgContent && typeof svgContent === 'string') {
        element.innerHTML = svgContent
      }
    } catch (_e) {
      console.error('Mermaid render error:', _e)
      element.classList.add('mermaid-error')

      // 显示错误提示
      element.innerHTML = `<div class="mermaid-error-message">
        <svg viewBox="0 0 24 24" width="20" height="20" style="vertical-align: middle; margin-right: 5px;">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Mermaid 图表渲染失败（可能是语法错误）
      </div>`
    }
  }

  /**
   * 检查是否已支持 Mermaid
   */
  isSupported(): boolean {
    return this.mermaidInitialized && !!window.mermaid
  }

  /**
   * 判断代码是否为 Mermaid 语法
   */
  isMermaidCode(code: string): boolean {
    const patterns = [
      /graph[\s\S]*?;/, // graph TD/RK/BD/LR;
      /flowchart[\s\S]*?;/, // flowchart TD;
      /sequenceDiagram[\s\S]*?;/,
      /classDiagram[\s\S]*?;/,
      /stateDiagram[\s\S]*?;/,
      /^\.mermaid[\s\S]*$/, // Mermaid 代码块标记
    ]

    for (const pattern of patterns) {
      if (pattern.test(code)) {
        return true
      }
    }
    return false
  }
}

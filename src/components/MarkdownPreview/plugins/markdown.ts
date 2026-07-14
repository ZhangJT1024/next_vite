import type { VNode } from 'vue'
import * as marked from 'marked'

/**
 * Markdown 渲染配置
 */
export interface MarkdownConfig {
  /** 是否启用 HTML 解析 */
  enableHTML?: boolean
  /** 自定义链接处理函数 */
  linkHandler?: (href: string, text: string, title?: string) => void
  /** 自定义代码块处理函数 */
  codeBlockHandler?: (code: string, language: string) => VNode
  /** 是否启用任务列表渲染 */
  enableTaskList?: boolean
}

/**
 * Marked 插件 - 为 marked 实例注入自定义渲染管线
 */
export class MarkdownPlugin {
  private config: Required<MarkdownConfig>

  constructor(config: MarkdownConfig = {}) {
    this.config = {
      enableHTML: true,
      linkHandler: undefined,
      codeBlockHandler: undefined,
      enableTaskList: false,
      ...config,
    } as Required<MarkdownConfig>
  }

  /**
   * 安装插件到 marked 实例
   */
  use(markedInstance: typeof marked): void {
    // Markdown 基础规则
    markedInstance.setOptions({
      gfm: true, // GitHub flavored Markdown
      breaks: true, // 换行符转<br>
    })

    // 自定义渲染器
    const renderer = new markedInstance.Renderer()

    // 代码块高亮（使用 highlight.js）
    if (this.config.codeBlockHandler) {
      renderer.code = (code: string, language: string): string => {
        try {
          const highlighted = this.highlightCode(code, language || '')
          return `<pre><code class="hljs">${highlighted}</code></pre>`
        } catch (_e) {
          return `<pre><code>${markedInstance.escape(code)}</code></pre>`
        }
      }
    }

    // 链接处理
    if (this.config.linkHandler) {
      const originalLink = renderer.link.bind(renderer)
      renderer.link = (href: string, text: string, title?: string): string => {
        if (this.config.linkHandler) {
          this.config.linkHandler(href, text, title)
        }
        return originalLink(href, text, title)
      }
    }

    // 任务列表（如果启用）
    if (this.config.enableTaskList) {
      renderer.listitem = (text: string, task?: boolean, checked?: boolean): string => {
        if (!task) {
          return `<li>${text}</li>`
        }
        const checkbox = checked
          ? '<input checked disabled type="checkbox"> '
          : '<input disabled type="checkbox"> '
        return `<li class="task-list-item">${checkbox}${text}</li>`
      }
    }

    markedInstance.use({ renderer })
  }

  /**
   * 高亮代码块（使用 highlight.js）
   */
  private highlightCode(code: string, language: string): string {
    try {
      if (!language) {
        return markedInstance.escape(code)
      }

      let hljs: ReturnType<typeof require>
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        hljs = require('highlight.js')
      } catch {
        return markedInstance.escape(code)
      }

      try {
        // @ts-ignore
        return hljs.highlight(code, { language }).value
      } catch {
        // 不支持的语言，尝试 auto-detect
        try {
          // @ts-ignore
          return hljs.highlightAuto(code).value
        } catch {
          return markedInstance.escape(code)
        }
      }
    } catch (e) {
      console.error('Code highlighting failed:', e)
      return markedInstance.escape(code)
    }
  }

  /**
   * 创建带插件的 marked 实例
   */
  static createInstance(config?: MarkdownConfig): typeof marked {
    const plugin = new MarkdownPlugin(config)
    plugin.use(marked)
    return marked
  }
}

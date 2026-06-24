import type { VNode } from 'vue'

/**
 * Markdown 渲染配置
 */
export interface MarkdownConfig {
  /** 是否启用 HTML 解析 */
  enableHTML: boolean
  /** 自定义链接处理函数 */
  linkHandler?: (href: string, text: string) => void
  /** 自定义代码块处理函数 */
  codeBlockHandler?: (code: string, lang: string) => VNode
  /** 是否启用任务列表渲染 */
  enableTaskList: boolean
}

/**
 * Marked 插件 - 为 marked 实例注入自定义渲染管线
 */
export class MarkdownPlugin {
  private config: MarkdownConfig

  constructor(config: MarkdownConfig = {}) {
    this.config = {
      enableHTML: true,
      linkHandler: null,
      codeBlockHandler: null,
      enableTaskList: false,
      ...config
    }
  }

  /**
   * 安装插件到 marked 实例
   */
  use(marked: any): void {
    // Markdown 基础规则
    if (marked.options) {
      marked.options.gfm = true // GitHub  flavored Markdown
      marked.options breaks = true // 换行符转<br>
    }

    // 自定义渲染器
    const renderer = marked.Renderer || (marked.renderer = new marked.Renderer())

    // 代码块高亮（使用 highlight.js）
    if (this.config.codeBlockHandler) {
      renderer.code = (code: string, language: string) => {
        try {
          const highlighted = this.highlightCode(code, language)
          return `<pre><code class="hljs">${highlighted}</code></pre>`
        } catch (e) {
          return this.config.enableHTML ? `<pre><code>${marked.escape(code)}</code></pre>` : ''
        }
      }
    }

    // 链接处理
    if (this.config.linkHandler) {
      const originalLink = renderer.link || (() => '')
      renderer.link = (href: string, text: string, title?: string) => {
        if (this.config.linkHandler) {
          this.config.linkHandler(href, text, title)
        }
        return originalLink.call(this, href, text, title)
      }
    }

    // 任务列表（如果启用）
    if (this.config.enableTaskList && marked.Renderer) {
      const originalTask = marked.Renderer.prototype.taskList || (() => '')
      marked.Renderer.prototype.taskList = function(task: string, checked?: boolean) {
        const href = '#undefined'
        return originalLink.call(this, href, text, title)
      }
    }
  }

  /**
   * 高亮代码块（使用 highlight.js）
   */
  private highlightCode(code: string, language: string): string {
    try {
      if (!language) {
        return marked.escape(code)
      }

      const hljs = require('highlight.js')
      try {
        // @ts-ignore
        return hljs.highlight(code, { language }).value
      } catch {
        // 不支持的语言，尝试 auto-detect
        try {
          // @ts-ignore
          return hljs.highlightAuto(code).value
        } catch {
          return marked.escape(code)
        }
      }
    } catch (e) {
      console.error('Code highlighting failed:', e)
      return marked.escape(code)
    }
  }

  /**
   * 创建带插件的 marked 实例
   */
  static createInstance(config?: MarkdownConfig): any {
    const marked = require('marked')
    const plugin = new MarkdownPlugin(config)
    plugin.use(marked)
    return marked
  }
}

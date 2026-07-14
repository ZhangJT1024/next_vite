/**
 * KaTeX 数学公式渲染器
 *
 * 支持：
 * - 行内公式 $...$
 * - 块级公式 $$...$$ 或 \[\...\]
 */

declare global {
  interface Window {
    katex?: {
      render: (text: string, element: HTMLElement, options: Record<string, unknown>) => void
    }
  }
}

export class KatexRenderer {
  private katexInitialized = false
  private readonly renderTimeout = 100

  /**
   * 渲染数学公式（延迟渲染避免闪烁）
   */
  async render(element: HTMLElement): Promise<void> {
    if (!window.katex) {
      console.warn('KaTeX not loaded')
      return
    }

    // 提取所有公式元素
    const blockElements = element.querySelectorAll('[data-mathjax-render]')
    const inlineElements = element.querySelectorAll('.katex-inline')

    // 块级公式（高优先级）
    for (const el of Array.from(blockElements)) {
      await this.renderBlock(el as HTMLElement)
    }

    // 行内公式
    for (const el of Array.from(inlineElements)) {
      await this.renderInline(el as HTMLElement)
    }
  }

  /**
   * 渲染块级公式
   */
  private async renderBlock(el: HTMLElement): Promise<void> {
    const text = el.textContent?.trim() || ''
    if (!text) return

    try {
      // 延迟渲染避免布局抖动
      await new Promise((resolve) => setTimeout(resolve, this.renderTimeout))

      window.katex.render(text, el, {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      })
    } catch (e) {
      console.error('KaTeX render error:', e)
      // 渲染失败，恢复原始文本
      el.innerHTML = text
    }
  }

  /**
   * 渲染行内公式
   */
  private async renderInline(el: HTMLElement): Promise<void> {
    const parent = el.parentElement
    if (!parent) return

    try {
      await new Promise((resolve) => setTimeout(resolve, this.renderTimeout))

      window.katex.render(el.textContent?.trim() || '', parent, {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      })
    } catch (e) {
      console.error('KaTeX inline render error:', e)
    }
  }

  /**
   * 初始化（延迟加载 KaTeX）
   */
  async init(): Promise<void> {
    if (this.katexInitialized || window.katex) {
      this.katexInitialized = true
      return
    }

    // 动态加载 Katex（生产环境建议使用 CDN）
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js'
    script.async = true

    script.onload = () => {
      this.katexInitialized = true

      // 加载扩展（可选：支持更多数学符号）
      const macrosScript = document.createElement('script')
      macrosScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/mhchem.min.js'
      macrosScript.async = true

      macrosScript.onload = () => {
        console.log('KaTeX loaded with mhchem support')
      }
    }

    document.head.appendChild(script)
  }
}

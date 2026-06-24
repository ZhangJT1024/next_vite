<template>
  <div class="markdown-preview" :class="{ 'done': isDone }">
    <!-- 内容区域 -->
    <div class="content" ref="contentRef">
      <slot name="default"></slot>
    </div>

    <!-- 打字机缓冲区 -->
    <div v-if="isStreaming" class="typing-indicator">
      <el-icon><Loading /></el-icon>
      <span>{{ typingText }}</span>
    </div>

    <!-- 完成状态 -->
    <div v-else-if="isDone && hasContent" class="completed">
      <el-icon :class="{ 'text-success': !error }"><Success /></el-icon>
      <span>已完成</span>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error">
      <el-icon><Warning /></el-icon>
      <span>{{ error }}</span>
    </div>

    <!-- 空状态占位符 -->
    <div v-else class="empty-state">
      <slot name="empty">
        <span class="placeholder-text">等待响应...</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { ElMessage } from 'element-plus'
import Success from '~icons/ep/success'
import Warning from '~icons/ep/warning'
import Loading from '~icons/ep/loading'

// ==================== Props ====================

interface Props {
  /** 原始响应文本（增量内容会追加到这里） */
  modelValue: string
  /** 是否正在流式生成 */
  isStreaming: boolean
  /** 加载进度 (0-100) */
  loadingProgress: number
  /** 错误信息 */
  error?: string | null
  /** Markdown 配置 */
  markdownConfig?: {
    enableHTML?: boolean
    linkHandler?: (href: string, text: string) => void
  }
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  isStreaming: false,
  loadingProgress: 0,
  error: null
})

// ==================== Emits ====================

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'update', text: string, done: boolean): void
}

defineEmits<Emits>()

// ==================== Refs ====================

const contentRef = ref<HTMLElement | null>(null)

// ==================== Computed ====================

const isDone = computed(() => {
  return props.isStreaming === false && props.loadingProgress >= 100
})

const hasContent = computed(() => {
  return props.modelValue.trim().length > 0
})

// ==================== Methods ====================

/**
 * 渲染 Markdown（增量更新）
 */
async function renderMarkdown(): Promise<void> {
  if (!props.modelValue || !contentRef.value) return

  const escapedText = marked.parse(props.modelValue, {
    async: false,
    breaks: true,
    gfm: true
  })

  // 使用 dangerouslySetInnerHTML（生产环境建议加强 CSP）
  contentRef.value.innerHTML = props.markdownConfig?.enableHTML
    ? escapedText
    : marked.escape(props.modelValue)
}

/**
 * 代码块高亮处理
 */
function highlightCode(): void {
  if (!contentRef.value || !hljs) return

  const preElements = contentRef.value.querySelectorAll('pre')
  preElements.forEach(pre => {
    const codeEl = pre.querySelector('code')
    if (codeEl && hljs.highlight) {
      try {
        const codeText = codeEl.textContent || ''
        const lang = pre.className.replace('language-', '')

        const result = hljs.highlight(codeText, { language: lang || 'plaintext' })
        codeEl.innerHTML = result.value
      } catch (e) {
        console.error('Code highlight failed:', e)
      }
    }
  })
}

/**
 * 触发更新事件（供父组件使用）
 */
function emitUpdate(text: string, done: boolean): void {
  const { loadingProgress } = props
  if (loadingProgress < 100) {
    // 流式状态中，按进度估算文本长度
    const estimatedLength = (loadingProgress / 100) * 200
    emit('update', text.slice(0, estimatedLength), false)
  } else {
    // 完成状态
    emit('update', text, true)
  }

  emit('update', props.modelValue, isDone.value)
}

/**
 * 滚动到当前消息底部
 */
async function scrollToBottom(): Promise<void> {
  if (contentRef.value) {
    contentRef.value.scrollTop = contentRef.value.scrollHeight
  }
}

/**
 * 处理文本溢出（长文本截断）
 */
function handleOverflow(maxLength: number = 200): string {
  if (props.modelValue.length <= maxLength) {
    return props.modelValue
  }

  return props.modelValue.slice(0, maxLength).trim() + '...'
}

// ==================== Watchers ====================

/**
 * 监听文本变化，自动滚动到底部
 */
watch(
  () => props.modelValue,
  async (newVal) => {
    if (props.isStreaming || props.loadingProgress > 0) {
      await scrollToBottom()
    }
  },
  { flush: 'post' }
)

/**
 * 监听错误状态
 */
watch(
  () => props.error,
  (newError) => {
    if (newError) {
      ElMessage.error(newError)
    }
  }
)

// ==================== Expose ====================

defineExpose({
  renderMarkdown,
  highlightCode,
  scrollToBottom,
  handleOverflow
})
</script>

<style scoped lang="scss">
.markdown-preview {
  min-height: 1em;
  width: 100%;

  .content {
    font-size: 14px;
    line-height: 1.6;
    word-wrap: break-word;
    word-break: break-word;

    // 基础 Markdown 样式
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1em;
      margin-bottom: 0.5em;
      font-weight: bold;
    }

    p {
      margin: 0.5em 0;
    }

    code {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;

      &:hover {
        background-color: rgba(0, 0, 0, 0.15);
      }
    }

    pre {
      background-color: #282c34;
      color: #abb2bf;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;

      code {
        background-color: transparent;
        padding: 0;
        font-family: 'Consolas', 'Monaco', monospace;
        line-height: 1.5;
      }
    }

    blockquote {
      border-left: 4px solid #409eff;
      margin: 0;
      padding-left: 12px;
      color: #666;
      background-color: #f9fafc;
    }

    ul, ol {
      padding-left: 20px;
      margin: 0.5em 0;
    }

    li {
      margin: 4px 0;
    }

    a {
      color: #409eff;
      text-decoration: underline;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;

      th, td {
        border: 1px solid #ebeef5;
        padding: 8px 12px;
        text-align: left;
      }

      th {
        background-color: #f5f7fa;
        font-weight: bold;
      }
    }
  }

  .typing-indicator,
  .completed,
  .error,
  .empty-state {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background-color: #f5f7fa;
    border-radius: 8px;

    span {
      font-size: 13px;
      color: #606266;
    }
  }

  .typing-indicator {
    justify-content: center;
  }

  .completed {
    justify-content: flex-start;
    border-left: 4px solid #67c23a;

    span {
      color: #909399;
    }
  }

  .error {
    justify-content: center;
    background-color: #fef0f0;
    border-left: 4px solid #f56c6c;

    span {
      color: #f56c6c;
    }
  }

  .empty-state {
    justify-content: center;
    padding: 32px;

    .placeholder-text {
      color: #c0c4cc;
      font-size: 13px;
    }
  }

  // 完成状态样式
  &.done {
    .content {
      p, code, pre, blockquote, ul, ol, li, a, img, table, th, td {
        opacity: 1;
      }
    }
  }
}
</style>

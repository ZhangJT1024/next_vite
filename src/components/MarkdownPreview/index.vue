<template>
  <div class="markdown-preview" :class="{ done: isDone }">
    <!-- 内容区域 -->
    <div ref="contentRef" class="content">
      <slot name="default"></slot>
    </div>

    <!-- 打字机缓冲区 -->
    <div v-if="isStreaming" class="typing-indicator">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ typingText }}</span>
    </div>

    <!-- 完成状态 -->
    <div v-else-if="isDone && hasContent" class="completed">
      <el-icon :class="{ 'text-success': !error }"><SuccessFilled /></el-icon>
      <span>已完成</span>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error">
      <el-icon><WarningFilled /></el-icon>
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
import { ref, computed, watch, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { Loading, SuccessFilled, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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
  error: null,
})

// ==================== Emits ====================

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'update', text: string, done: boolean): void
}

const emit = defineEmits<Emits>()

// ==================== Refs ====================

const contentRef = ref<HTMLElement | null>(null)

// ==================== Computed ====================

const isDone = computed(() => {
  return props.isStreaming === false && props.loadingProgress >= 100
})

const hasContent = computed(() => {
  return props.modelValue.trim().length > 0
})

/** 打字机提示文字（动态省略号） */
const typingText = computed(() => {
  if (!props.isStreaming) return ''
  const progress = props.loadingProgress
  if (progress <= 0) return '正在思考...'
  if (progress < 30) return '正在生成...'
  if (progress < 80) return '正在输出...'
  return '即将完成...'
})

// ==================== Methods ====================

/**
 * 渲染 Markdown（增量更新）
 */
async function renderMarkdown(): Promise<void> {
  if (!props.modelValue || !contentRef.value) return

  try {
    const html = marked.parse(props.modelValue, {
      async: false,
      breaks: true,
      gfm: true,
    }) as string

    contentRef.value.innerHTML = html

    // 渲染完成后高亮代码块
    await nextTick()
    highlightCode()
  } catch (e) {
    console.error('Markdown 渲染失败:', e)
  }
}

/**
 * 代码块高亮处理
 */
function highlightCode(): void {
  if (!contentRef.value) return

  const codeElements = contentRef.value.querySelectorAll('pre code')
  codeElements.forEach((codeEl) => {
    if (codeEl.classList.contains('hljs')) return // 已高亮，跳过

    try {
      // marked 把语言类放在 code 元素上，格式为 language-xxx
      const langClass = Array.from(codeEl.classList).find((c) => c.startsWith('language-'))
      const lang = langClass ? langClass.replace('language-', '') : ''

      if (lang && hljs.getLanguage(lang)) {
        const result = hljs.highlight(codeEl.textContent || '', {
          language: lang,
        })
        codeEl.innerHTML = result.value
      } else {
        hljs.highlightElement(codeEl as HTMLElement)
      }
    } catch (e) {
      console.error('代码高亮失败:', e)
    }
  })
}

/**
 * 触发更新事件（供父组件使用）
 */
function emitUpdate(text: string, done: boolean): void {
  emit('update', text, done)
}

/**
 * 滚动到当前消息底部
 */
async function scrollToBottom(): Promise<void> {
  await nextTick()
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
 * 监听文本变化，自动渲染并滚动到底部
 */
watch(
  () => props.modelValue,
  async () => {
    await renderMarkdown()
    if (props.isStreaming || props.loadingProgress > 0) {
      await scrollToBottom()
    }
  },
  { flush: 'post' },
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
  },
)

// ==================== Expose ====================

defineExpose({
  renderMarkdown,
  highlightCode,
  scrollToBottom,
  handleOverflow,
  emitUpdate,
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
    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: 1em;
      margin-bottom: 0.5em;
      font-weight: bold;
    }

    :deep(p) {
      margin: 0.5em 0;
    }

    :deep(code) {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;

      &:hover {
        background-color: rgba(0, 0, 0, 0.15);
      }
    }

    :deep(pre) {
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

    :deep(blockquote) {
      border-left: 4px solid #409eff;
      margin: 0;
      padding-left: 12px;
      color: #666;
      background-color: #f9fafc;
    }

    :deep(ul),
    :deep(ol) {
      padding-left: 20px;
      margin: 0.5em 0;
    }

    :deep(li) {
      margin: 4px 0;
    }

    :deep(a) {
      color: #409eff;
      text-decoration: underline;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }

    :deep(table) {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;

      th,
      td {
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
      :deep(p),
      :deep(code),
      :deep(pre),
      :deep(blockquote),
      :deep(ul),
      :deep(ol),
      :deep(li),
      :deep(a),
      :deep(img),
      :deep(table),
      :deep(th),
      :deep(td) {
        opacity: 1;
      }
    }
  }
}
</style>

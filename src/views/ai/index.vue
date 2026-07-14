<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <div class="chat-header">
      <h2>AI 助手</h2>
      <div class="model-selector">
        <el-select
          v-model="store.model"
          size="small"
          placeholder="选择模型"
          @change="onModelChange"
        >
          <el-option label="默认模型 (Mock)" :value="'default'" />
          <el-option v-if="useClaude && hasToken" label="Claude 3.5 Sonnet" :value="'claude'" />
          <el-option v-if="useGPT && hasToken" label="GPT-4o" :value="'gpt'" />
        </el-select>
      </div>
    </div>

    <!-- 对话区域 -->
    <div ref="messagesContainerRef" class="chat-messages">
      <transition-group name="fade-expand" tag="div">
        <div
          v-for="(msg, index) in store.history"
          :key="index"
          :class="['message', `role-${msg.role}`]"
        >
          <div class="message-avatar">
            <el-icon v-if="msg.role === 'assistant'"><ChatDotRound /></el-icon>
            <el-icon v-else-if="msg.role === 'user'"><UserFilled /></el-icon>
          </div>

          <div class="message-content">
            <span
              v-if="msg.role !== 'system' && msg.content"
              :class="{ 'markdown-body': isMarkdownModel }"
              v-html="formatMessage(msg.content)"
            ></span>

            <!-- 加载中 -->
            <div
              v-if="store.isThinking && msg.role === 'assistant' && !msg.content"
              class="streaming-indicator"
            >
              <el-icon><Loading /></el-icon>
              <span>正在思考...</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div v-if="msg.role === 'assistant' && !store.isThinking" class="message-actions">
            <el-button link type="primary" size="small" @click="copyMessage(msg.content)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
        </div>

        <!-- 空状态提示 -->
        <div v-if="store.history.length === 0 && !store.input" class="empty-state">
          <el-empty description="请输入问题开始对话" :image-size="80"></el-empty>
        </div>
      </transition-group>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-wrapper">
      <el-input
        v-model="store.input"
        type="textarea"
        :autosize="{ minRows: 2 }"
        placeholder="请输入您的问题..."
        resize="none"
        size="large"
        @keyup.enter="handleSend"
      />

      <div class="input-actions">
        <el-tooltip content="发送" placement="top">
          <el-button
            :loading="store.isThinking"
            type="primary"
            size="large"
            :disabled="!store.input.trim()"
            @click="handleSend"
          >
            <el-icon><Upload /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 历史记录提示 -->
    <div class="history-footer">
      <span v-if="store.sessions.length > 0" class="session-count">
        当前会话：{{ store.sessions.length }}
      </span>
      <el-button link type="primary" size="small" @click="clearHistory">清空历史</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/store/business/chat'
import type { ModelProvider } from '@/store/business/chat'
import { ChatDotRound, UserFilled, CopyDocument, Loading, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { local } from '@/utils'

// ==================== Store 引用 ====================
const store = useChatStore()

// ==================== 状态定义 ====================
const messagesContainerRef = ref<HTMLElement>()
const useClaude = !!import.meta.env.VITE_CLAUDE_API_URL
const useGPT = !!import.meta.env.VITE_GPT_API_URL
const tokenStr = local().get('token', '')
const hasToken = !!tokenStr

// 判断是否为 Markdown 模型
const isMarkdownModel = computed<boolean>(() => {
  const currentModel = store.model // 'default' | 'claude' | 'gpt'
  return currentModel === 'claude' || currentModel === 'gpt'
})

// ==================== 消息格式化（支持 Markdown） ====================
/**
 * 简单的 Markdown 渲染器
 */
function formatMessage(text: string): string {
  if (!text) return ''

  // 先处理代码块（避免内部被其他规则影响）
  let formatted = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<pre class="code-block"><code class="language-${lang || 'plaintext'}">${escapedCode}</code></pre>`
  })

  formatted = formatted
    // inline 代码
    .replace(/`([^`]+)`/g, (_, code) => {
      return `<code class="inline-code">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`
    })
    // 换行（先处理）
    .replace(/\n/g, '<br>')
    // 粗体
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // 链接
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" class="markdown-link">$1</a>',
    )

  // 处理列表（需要按行处理，避免嵌套错误）
  const lines = formatted.split('<br>')
  let inOrderedList = false
  let inUnorderedList = false
  const processedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/)
    const unorderedMatch = line.match(/^-\s+(.*)$/)

    if (orderedMatch) {
      if (!inOrderedList) {
        processedLines.push('<ol>')
        inOrderedList = true
      }
      processedLines.push(`<li>${orderedMatch[2]}</li>`)
    } else if (unorderedMatch) {
      if (!inUnorderedList) {
        processedLines.push('<ul>')
        inUnorderedList = true
      }
      processedLines.push(`<li>${unorderedMatch[1]}</li>`)
    } else {
      // 结束列表
      if (inOrderedList) {
        processedLines.push('</ol>')
        inOrderedList = false
      }
      if (inUnorderedList) {
        processedLines.push('</ul>')
        inUnorderedList = false
      }
      processedLines.push(line)
    }
  }

  // 确保列表闭合
  if (inOrderedList) processedLines.push('</ol>')
  if (inUnorderedList) processedLines.push('</ul>')

  formatted = processedLines.join('<br>')

  // 处理引用
  formatted = formatted.replace(/<br>>\s*(.*?)$/gm, '<blockquote>$1</blockquote>')

  return formatted
}

// ==================== 事件处理 ====================

/** 模型切换 */
const onModelChange = (model: ModelProvider) => {
  store.setModel(model)
  console.log('切换到模型:', model)
}

/** 发送消息 */
const handleSend = async () => {
  const content = store.input.trim()
  if (!content) return

  // 初始化会话（如果还没有）
  if (store.sessions.length === 0) {
    store.initSession()
  }

  // 添加到历史（用户消息）
  store.history.push({ role: 'user', content })

  // 创建 assistant 消息占位符
  store.history.push({
    role: 'assistant',
    content: '',
  })
  const assistantIndex = store.history.length - 1

  // 清空输入框
  store.input = ''

  // 滚动到底部
  scrollToBottom()

  // 开始流式生成
  try {
    const type = getModelType(store.model)
    const stream = await store.createStream(type)

    // 读取流式响应
    for await (const chunk of stream) {
      if (chunk.done) break
      if (!chunk.content) continue

      if (assistantIndex < store.history.length) {
        const prevContent = store.history[assistantIndex].content || ''
        const newContent = prevContent + chunk.content
        store.history[assistantIndex] = { ...store.history[assistantIndex], content: newContent }
      }

      scrollToBottom()
    }

    // 更新会话记录
    const currentSession = store.currentSession
    if (currentSession && assistantIndex < store.history.length) {
      currentSession.answers.push({
        timestamp: Date.now(),
        content: store.history[assistantIndex].content,
      })
    }

    // 生成完成
    ElMessage.success('回复完成')
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '生成失败，请重试'
    console.error('流式响应错误:', error)
    ElMessage.error(errMsg)
    // 移除失败的 assistant 消息
    if (assistantIndex < store.history.length) {
      store.history.splice(assistantIndex, 1)
    }
  }
}

/** 根据模型类型返回 content type */
function getModelType(model: ModelProvider): 'default' | 'code' | 'markdown' {
  // model: 'default' | 'claude' | 'gpt' | 'ollama'
  return model === 'claude' || model === 'gpt' ? 'markdown' : 'default'
}

/** 滚动到底部 */
const scrollToBottom = () => {
  nextTick(() => {
    messagesContainerRef.value?.scrollTo({
      top: messagesContainerRef.value.scrollHeight,
      behavior: 'smooth',
    })
  })
}

/** 复制消息内容 */
const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

/** 清空历史 */
const clearHistory = () => {
  ElMessageBox.confirm('确定要清空所有历史记录吗？', '提示', {
    type: 'warning',
  })
    .then(() => {
      store.clearHistory()
      store.input = ''
      ElMessage.success('历史记录已清空')
    })
    .catch(() => {
      // 用户取消
    })
}

// ==================== 生命周期 ====================
onMounted(() => {
  // 初始化第一个会话
  store.initSession()
})
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  background-color: #f5f7fa;

  // 顶部导航栏
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    h2 {
      margin: 0;
      font-size: 20px;
      color: #303132;
    }

    .model-selector {
      .el-select {
        min-width: 180px;
      }
    }
  }

  // 对话区域
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;

    .message {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      &.role-assistant {
        align-self: flex-start;
      }

      &.role-user {
        align-self: flex-end;
        flex-direction: row-reverse;

        .message-avatar {
          display: none;
        }

        .message-content {
          background-color: #409eff;
          color: #fff;

          span {
            color: #fff !important;
          }
        }
      }

      // 消息头像
      .message-avatar {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: #409eff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;

        .el-icon {
          font-size: 18px;
        }
      }

      // 消息内容
      .message-content {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 12px;
        position: relative;
        background-color: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        .markdown-body {
          word-break: break-word;
          line-height: 1.6;

          // Markdown 样式
          code.inline-code,
          pre.code-block {
            background-color: #f4f4f5;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 13px;
          }

          pre.code-block {
            display: block;
            margin: 10px 0;
            padding: 12px;
            border-radius: 8px;
            overflow-x: auto;

            code {
              background: none;
              padding: 0;
            }
          }

          a.markdown-link {
            color: #409eff;
            text-decoration: underline;

            &:hover {
              color: #66b1ff;
            }
          }

          strong {
            font-weight: 600;
          }

          em {
            font-style: italic;
          }
        }

        // 加载中指示器
        .streaming-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          color: #909399;
          font-size: 13px;

          .el-icon {
            font-size: 16px;
            animation: rotating 1s linear infinite;
          }
        }
      }

      // 操作按钮
      .message-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;

        .el-button {
          padding: 6px 12px;
        }
      }
    }

    // 空状态
    .empty-state {
      align-self: center;

      .el-empty__description {
        color: #909399;
      }
    }
  }

  // 输入区域
  .chat-input-wrapper {
    background-color: #fff;
    border-top: 1px solid #e4e7ed;
    padding: 16px 24px;
    display: flex;
    align-items: flex-end;
    gap: 12px;

    .el-textarea {
      flex: 1;

      &::placeholder {
        color: #a0aec0;
      }
    }

    .input-actions {
      display: flex;
    }
  }

  // 历史记录提示
  .history-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 24px;
    background-color: #f5f7fa;
    border-top: 1px solid #e4e7ed;

    .session-count {
      font-size: 13px;
      color: #909399;
    }
  }
}

// ==================== 动画定义 ====================
.fade-expand-enter-active,
.fade-expand-leave-active {
  transition: all 0.3s ease;
}

.fade-expand-enter-from,
.fade-expand-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <div class="welcome-page">
    <!-- 主标题 -->
    <div class="header-section">
      <h1>🚀 Vite + Vue3 + Pinia + Element Plus</h1>
      <p>现代化后台管理系统 - 快速启动演示</p>
    </div>

    <!-- 项目特性 -->
    <div class="features-grid">
      <div class="feature-card" @click="navigateTo('/login')">
        <div class="icon">🚪</div>
        <h3>登录页面</h3>
        <p>用户名密码登录、记住我功能</p>
      </div>

      <div class="feature-card" @click="navigateTo('/register')">
        <div class="icon">📝</div>
        <h3>用户注册</h3>
        <p>创建新账号、设置密码</p>
      </div>

      <div class="feature-card" @click="navigateTo('/dashboard')">
        <div class="icon">📊</div>
        <h3>仪表盘</h3>
        <p>数据统计、用户管理、系统监控</p>
      </div>

      <div class="feature-card" @click="navigateTo('/settings')">
        <div class="icon">⚙️</div>
        <h3>系统设置</h3>
        <p>基本信息、安全设置、数据备份</p>
      </div>
    </div>

    <!-- 技术栈 -->
    <div class="tech-section">
      <h2>💻 技术栈</h2>
      <div class="tech-tags">
        <span class="tag">Vue 3</span>
        <span class="tag">Vite 5.2</span>
        <span class="tag">Element Plus</span>
        <span class="tag">Pinia</span>
        <span class="tag">TypeScript</span>
        <span class="tag">Vue Router</span>
      </div>
    </div>

    <!-- 快速导航按钮 -->
    <div class="action-buttons">
      <el-button type="primary" size="large" @click="navigateTo('/login')">进入登录页面</el-button>
      <el-button type="success" size="large" @click="navigateTo('/register')">
        进入注册页面
      </el-button>
      <el-button type="warning" size="large" @click="navigateTo('/dashboard')">
        直接进入仪表盘
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
.welcome-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .header-section {
    text-align: center;
    margin-bottom: 40px;

    h1 {
      color: white;
      font-size: 3em;
      margin: 0 0 10px 0;
      font-weight: 700;
    }

    p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.3em;
      margin: 0;
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    max-width: 1000px;
    margin: 0 auto 40px;

    .feature-card {
      background: white;
      padding: 30px 20px;
      border-radius: 16px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      }

      .icon {
        font-size: 3em;
        margin-bottom: 15px;
      }

      h3 {
        color: #303133;
        font-size: 1.2em;
        margin: 0 0 8px 0;
      }

      p {
        color: #909399;
        font-size: 14px;
        margin: 0;
      }
    }
  }

  .tech-section {
    text-align: center;
    max-width: 600px;
    margin: 0 auto 40px;

    h2 {
      color: white;
      font-size: 1.8em;
      margin: 0 0 20px 0;
    }

    .tech-tags {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;

      .tag {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        backdrop-filter: blur(10px);
      }
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    max-width: 500px;
    margin: 0 auto;
  }
}
</style>

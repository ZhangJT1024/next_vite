<template>
  <div class="login-container">
    <el-card shadow="never" class="login-card">
      <div class="login-header">
        <h2>后台管理系统</h2>
        <p>欢迎登录</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            size="large"
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="remember">记住我</el-checkbox>
          <el-link type="primary" underline>忘记密码</el-link>
        </el-form-item>

        <el-button
          type="primary"
          :loading="loading"
          size="large"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>

      <div class="login-footer">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </el-card>

    <!-- 提示信息 -->
    <div class="info-tip">
      <p>系统版本：v1.0.0</p>
      <p>技术支持：技术支持团队</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 记住我
const remember = ref(false)

// loading
const loading = ref(false)

// 登录按钮防抖
let loginTimer: ReturnType<typeof setTimeout> | null = null

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 位', trigger: 'blur' }
  ]
}

// 登录
const handleLogin = async () => {
  // 防抖处理
  if (loginTimer) clearTimeout(loginTimer)
  loginTimer = setTimeout(async () => {
    await loginFormRef.value?.validate()

    loading.value = true
    try {
      const result = await userStore.login({
        username: loginForm.username,
        password: loginForm.password
      })

      if (result.success) {
        ElMessage.success('登录成功')
        // 延迟跳转，等待 store 更新
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      }
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败')
      loading.value = false
    } finally {
      loading.value = false
    }
  }, 1000)
}

// 表单实例
const loginFormRef = ref<FormInstance>()

onMounted(() => {
  // 如果已登录，跳转到首页
  if (userStore.isLoggedIn) {
    router.push('/dashboard')
  }
})
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-card {
    width: 400px;
    padding: 30px;
  }

  .login-header {
    text-align: center;
    margin-bottom: 30px;

    h2 {
      color: #fff;
      margin-bottom: 10px;
      font-size: 24px;
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }
  }

  .login-footer {
    text-align: center;
    margin-top: 20px;
    color: rgba(0, 0, 0, 0.65);

    a {
      color: #409eff;
    }
  }

  .info-tip {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(255, 255, 255, 0.95);
    padding: 15px 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    color: #606266;
    font-size: 12px;

    p {
      margin: 5px 0;
    }
  }
}
</style>

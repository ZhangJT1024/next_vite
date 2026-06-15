<template>
  <div class="register-container">
    <el-card shadow="never" class="register-card">
      <div class="register-header">
        <h2>用户注册</h2>
        <p>创建新账号</p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        size="large"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="用户名"
                :prefix-icon="User"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="nickname">
              <el-input
                v-model="registerForm.nickname"
                placeholder="昵称"
                :prefix-icon="UserFilled"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="设置密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="确认密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="邮箱（选填）"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item prop="agreeTerms">
          <el-checkbox v-model="registerForm.agreeTerms">
            我已阅读并同意
            <el-link type="primary" underline>用户协议</el-link> 和
            <el-link type="primary" underline>隐私政策</el-link>
          </el-checkbox>
        </el-form-item>

        <el-button
          type="primary"
          :loading="loading"
          size="large"
          @click="handleRegister"
        >
          注册
        </el-button>
      </el-form>

      <div class="register-footer">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, Message, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
const router = useRouter()
const userStore:any = useUserStore()

// 注册表单
const registerForm = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  email: '',
  agreeTerms: false
})

// loading
const loading = ref(false)

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3-20 个字符', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, message: '密码长度不能小于 5 位', trigger: 'blur' },
    { pattern: /^\S*$/, message: '密码不能包含特殊字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_, value) => {
        if (value && value !== registerForm.password) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ],
  agreeTerms: [{ type: 'boolean', message: '请同意用户协议和隐私政策', trigger: 'change' }]
}

// 注册
const handleRegister = async () => {
  await registerFormRef.value?.validate()
  loading.value = true
  const loginParams = {
    account: registerForm.username,
    password: registerForm.password,
    nickname: registerForm.nickname
  }
   userStore.register(loginParams).then(()=>{
      userStore.login(loginParams)
    }).finally(()=>{
      loading.value = false
    })
  
}

// 表单实例
const registerFormRef = ref<FormInstance>()

onMounted(() => {
  // 如果已登录，跳转到首页
  if (userStore.isLoggedIn) {
    router.push('/dashboard')
  }
})
</script>

<style scoped lang="scss">
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .register-card {
    width: 420px;
    padding: 30px;
  }

  .register-header {
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

  .register-footer {
    text-align: center;
    margin-top: 20px;
    color: rgba(0, 0, 0, 0.65);

    a {
      color: #409eff;
    }
  }
}
</style>

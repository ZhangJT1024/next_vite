<template>
  <div class="settings-container">
    <el-tabs v-model="activeTab" type="card">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>基本设置</span>
            </div>
          </template>

          <el-form label-width="100px">
            <el-form-item label="系统名称">
              <el-input v-model="form.systemName" />
            </el-form-item>
            <el-form-item label="Logo 地址">
              <el-input v-model="form.logoUrl" />
              <el-button type="primary" :icon="Upload" @click="uploadLogo">上传 Logo</el-button>
            </el-form-item>
            <el-form-item label="网站标题">
              <el-input v-model="form.siteTitle" />
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="hover" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>品牌设置</span>
            </div>
          </template>

          <el-form label-width="100px">
            <el-form-item label="主题色" style="margin-bottom: 20px;">
              <el-color-picker v-model="form.themeColor" />
            </el-form-item>

            <el-form-item label="深色模式" style="margin-bottom: 20px;">
              <el-switch v-model="form.darkMode" active-text="启用" inactive-text="禁用" />
            </el-form-item>

            <el-form-item label="语言">
              <el-select v-model="form.language">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 安全设置 -->
      <el-tab-pane label="安全设置" name="security">
        <el-alert title="安全建议" type="warning" :closable="false">
          <p>定期修改密码并启用双重验证可提高账户安全性。</p>
        </el-alert>

        <el-card shadow="hover" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>账户安全</span>
            </div>
          </template>

          <el-form label-width="100px">
            <el-form-item label="修改密码">
              <el-button type="primary" @click="changePassword">立即修改</el-button>
            </el-form-item>
            <el-form-item label="双重验证">
              <el-switch v-model="form.twoFactorAuth" active-text="启用" inactive-text="禁用" />
            </el-form-item>
            <el-form-item label="密码强度">
              <span :style="{ color: getStrengthColor(form.passwordStrength) }">
                {{ passwordStrengthLabels[form.passwordStrength] }}
              </span>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="hover" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>登录安全</span>
            </div>
          </template>

          <el-form label-width="100px">
            <el-form-item label="登录 IP 限制">
              <el-input v-model="form.ipWhitelist" placeholder="输入允许的 IP，用逗号分隔" />
            </el-form-item>
            <el-form-item label="失败次数限制">
              <el-input-number v-model="form.loginAttempts" :min="3" :max="10" /> 次
            </el-form-item>
            <el-form-item label="锁定时间">
              <el-slider v-model="form.lockTime" :max="60" format-tooltip="{ value: v => `${v}分钟` }" /> 分钟
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 数据管理 -->
      <el-tab-pane label="数据管理" name="data">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>数据备份</span>
            </div>
          </template>

          <el-row :gutter="20" style="margin-bottom: 20px;">
            <el-col :span="8">
              <el-button type="primary" :icon="Download" @click="backupData">备份数据</el-button>
            </el-col>
            <el-col :span="8">
              <el-button type="success" :icon="Upload" @click="restoreData">恢复数据</el-button>
            </el-col>
            <el-col :span="8" />
          </el-row>

          <el-table :data="backupList" border stripe>
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="size" label="大小" width="120">
              <template #default="{ row }">{{ formatSize(row.size) }}</template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="160">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" :icon="Download" @click="downloadBackup(row)">下载</el-button>
                <el-button size="small" type="primary" :icon="Delete" @click="deleteBackup(row.id, row.name)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card shadow="hover" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>系统日志</span>
            </div>
          </template>

          <el-tabs type="border-card">
            <el-tab-pane label="错误日志" name="error">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="等级">Error</el-descriptions-item>
                <el-descriptions-item label="时间">{{ errorLog.time }}</el-descriptions-item>
                <el-descriptions-item label="信息">{{ errorLog.message }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="操作日志" name="operation">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="用户">Admin</el-descriptions-item>
                <el-descriptions-item label="操作">修改配置</el-descriptions-item>
                <el-descriptions-item label="时间">{{ operationLog.time }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-tab-pane>

      <!-- 通知设置 -->
      <el-tab-pane label="通知设置" name="notifications">
        <el-form label-width="120px">
          <el-form-item label="邮件通知">
            <el-switch v-model="form.emailNotification" active-text="启用" inactive-text="禁用" />
          </el-form-item>
          <el-form-item label="短信通知">
            <el-switch v-model="form.smsNotification" active-text="启用" inactive-text="禁用" />
          </el-form-item>
          <el-form-item label="系统消息">
            <el-checkbox-group v-model="form.systemMessageTypes">
              <el-checkbox label="登录日志" />
              <el-checkbox label="操作提醒" />
              <el-checkbox label="安全警告" />
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- 弹窗 -->
    <PasswordDialog v-model:visible="passwordDialogVisible" @submit="handleChangePassword" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Upload, Download, Delete } from '@element-plus/icons-vue'
import PasswordDialog from './components/PasswordDialog.vue'

// 活动标签
const activeTab = ref('basic')

// 表单数据
const form = reactive({
  systemName: '后台管理系统',
  logoUrl: '',
  siteTitle: 'My Admin',
  themeColor: '#409eff',
  darkMode: false,
  language: 'zh-CN',
  twoFactorAuth: false,
  passwordStrength: 2,
  ipWhitelist: '',
  loginAttempts: 5,
  lockTime: 30,
  emailNotification: true,
  smsNotification: false,
  systemMessageTypes: ['登录日志', '操作提醒']
})

// 密码强度相关
const passwordStrength = ref(2)
const passwordStrengthLabels = {
  1: '弱',
  2: '中等',
  3: '强'
} as const

// 备份列表
const backupList = ref([
  { id: 1, name: 'backup_20240610.sql', size: 1024000, createdAt: '2024-06-10' },
  { id: 2, name: 'backup_20240608.sql', size: 980000, createdAt: '2024-06-08' }
])

// 日志数据
const errorLog = reactive({ time: '', message: '' })
const operationLog = reactive({ time: '' })

// 对话框
const passwordDialogVisible = ref(false)
const basicFormRef = ref<FormInstance>()

// 修改密码
const handleChangePassword = (newPassword: string) => {
  ElMessage.success('密码修改成功')
  passwordDialogVisible.value = false
}

// 上传 Logo
const uploadLogo = () => {
  ElMessage.info('请选择 Logo 图片')
}

// 备份数据
const backupData = () => {
  ElMessage.success('开始备份数据...')
}

// 恢复数据
const restoreData = () => {
  ElMessageBox.confirm('确定要恢复数据吗？这将覆盖现有数据。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('数据恢复成功')
  })
}

// 下载备份
const downloadBackup = (row: any) => {
  ElMessage.info(`正在下载 ${row.name}`)
}

// 删除备份
const deleteBackup = (id: number, name: string) => {
  ElMessageBox.confirm(`确定要删除 ${name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    backupList.value = backupList.value.filter(item => item.id !== id)
    ElMessage.success('删除成功')
  })
}

// 修改密码
const changePassword = () => {
  passwordDialogVisible.value = true
}

// 获取密码强度颜色
const getStrengthColor = (level: number): string => {
  if (level === 1) return '#f56c6c'
  if (level === 2) return '#e6a23c'
  return '#67c23a'
}

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)}MB`
  if (bytes > 1024) return `${(bytes / 1024).toFixed(2)}KB`
  return `${bytes}B`
}

// 格式化时间
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped lang="scss">
.settings-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-weight: 600;
    }
  }
}
</style>

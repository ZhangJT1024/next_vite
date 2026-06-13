<template>
  <el-dialog v-model="visible" title="修改密码" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="form.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="form.newPassword" type="password" show-password :placeholder="'长度至少 6 位，包含数字和字母'" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const visible = defineModel<boolean>()

interface Props {
  submit: (password: string) => void
}

const props = withDefaults(defineProps<Props>(), {})

const formRef = ref<FormInstance>()
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (_, value) => value && value === form.newPassword ? Promise.resolve() : Promise.reject(new Error('两次输入的密码不一致')) }
  ]
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  const token = localStorage.getItem('token')
  // TODO: 调用后端 API 修改密码
  try {
    ElMessage.success('密码修改成功')
    visible.value = false
    props.submit(form.newPassword)
  } catch (error) {
    ElMessage.error('密码修改失败')
  }
}
</script>

<style scoped lang="scss">
// 样式定义
</style>

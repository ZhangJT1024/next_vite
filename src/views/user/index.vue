<template>
  <div class="user-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户表格 -->
      <el-table v-loading="loading" :data="userList" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="nickname" label="昵称" width="150">
          <template #default="{ row }">
            <el-tag>{{ row.nickname }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ roleMap[row.role] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" :icon="Delete" type="danger" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="500px">
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑者" value="editor" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { UserInfo } from '@/types'

const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const userFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  username: '',
  status: '',
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

// 用户列表
const userList = ref<UserInfo[]>([])

// 角色映射
const roleMap = {
  admin: '管理员',
  editor: '编辑者',
  user: '普通用户',
}

// 表单数据
const formData = reactive({
  id: 0,
  username: '',
  nickname: '',
  email: '',
  phone: '',
  role: 'user',
  status: 'enabled',
})

// 表单验证规则
const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    userList.value = [
      {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        role: 'admin',
        status: 'enabled',
      },
      {
        id: 2,
        username: 'user1',
        nickname: '张三',
        email: 'zhangsan@example.com',
        phone: '13900139000',
        role: 'editor',
        status: 'enabled',
      },
      {
        id: 3,
        username: 'user2',
        nickname: '李四',
        email: 'lisi@example.com',
        phone: '13700137000',
        role: 'user',
        status: 'disabled',
      },
    ]
    pagination.total = userList.value.length
  } finally {
    loading.value = false
  }
}

// 获取角色类型
const getRoleType = (role: string): 'success' | 'warning' | 'info' => {
  if (role === 'admin') return 'danger'
  if (role === 'editor') return 'warning'
  return 'info'
}

// 新增用户
const handleAdd = () => {
  isEdit.value = false
  formData.id = 0
  formData.username = ''
  formData.nickname = ''
  formData.email = ''
  formData.phone = ''
  formData.role = 'user'
  formData.status = 'enabled'
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: UserInfo) => {
  isEdit.value = true
  formData.id = row.id
  formData.username = row.username
  formData.nickname = row.nickname
  formData.email = row.email || ''
  formData.phone = row.phone || ''
  formData.role = row.role
  formData.status = row.status
  dialogVisible.value = true
}

// 删除用户
const handleDelete = () => {
  ElMessage.warning('该功能需要后端 API 支持')
}

// 状态改变
const handleStatusChange = (row: UserInfo) => {
  const statusText = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`${row.nickname} 已${statusText}`)
}

// 提交表单
const handleSubmit = async () => {
  await userFormRef.value?.validate()
  ElMessage.success('操作成功')
  dialogVisible.value = false
  loadUserList()
}

// 搜索
const handleSearch = () => {
  ElMessage.info('搜索功能需要后端 API 支持')
}

// 重置搜索
const resetSearch = () => {
  searchForm.username = ''
  searchForm.status = ''
}

// 每页数量改变
const handleSizeChange = () => {
  loadUserList()
}

// 页码改变
const handlePageChange = () => {
  loadUserList()
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped lang="scss">
.user-list {
  padding: 20px;

  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

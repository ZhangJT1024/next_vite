<template>
  <div class="role-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增角色</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
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

      <!-- 角色表格 -->
      <el-table v-loading="loading" :data="roleList" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? '' : 'info'">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="权限码" width="200" />
        <el-table-column label="角色描述" min-width="180">
          <template #default="{ row }">
            <div style="max-height: 60px; overflow: hidden">{{ row.description }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="enabled"
              inactive-value="disabled"
              active-text="启用"
              inactive-text="禁用"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
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
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="500px">
      <el-form ref="roleFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限码" prop="code">
          <el-input v-model="formData.code" placeholder="如：admin:user:create" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
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

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

// loading
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const roleFormRef = ref<FormInstance>()

// 角色列表
const roleList = ref<any[]>([])

// 表单数据
const formData = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  status: 'enabled',
})

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限码', trigger: 'blur' }],
}

// 加载角色列表
const loadRoleList = async () => {
  loading.value = true
  try {
    roleList.value = [
      {
        id: 1,
        name: '超级管理员',
        code: '^admin$',
        description: '拥有系统所有权限',
        status: 'enabled',
        createdAt: '2024-01-01',
      },
      {
        id: 2,
        name: '编辑者',
        code: '^editor$',
        description: '可以编辑和管理内容',
        status: 'enabled',
        createdAt: '2024-01-05',
      },
      {
        id: 3,
        name: '普通用户',
        code: '^user$',
        description: '基础的查看权限',
        status: 'enabled',
        createdAt: '2024-01-10',
      },
    ]
    pagination.total = roleList.value.length
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}

// 新增角色
const handleAdd = () => {
  isEdit.value = false
  formData.id = 0
  formData.name = ''
  formData.code = ''
  formData.description = ''
  formData.status = 'enabled'
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (row: any) => {
  isEdit.value = true
  formData.id = row.id
  formData.name = row.name
  formData.code = row.code
  formData.description = row.description || ''
  formData.status = row.status
  dialogVisible.value = true
}

// 删除角色
const handleDelete = () => {
  ElMessage.warning('该功能需要后端 API 支持')
}

// 状态改变
const handleStatusChange = (row: any) => {
  const statusText = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`${row.name} 已${statusText}`)
}

// 提交表单
const handleSubmit = async () => {
  await roleFormRef.value?.validate()
  ElMessage.success('操作成功')
  dialogVisible.value = false
  loadRoleList()
}

// 搜索
const handleSearch = () => {
  ElMessage.info('搜索功能需要后端 API 支持')
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.status = ''
}

// 每页数量改变
const handleSizeChange = () => {
  loadRoleList()
}

// 页码改变
const handlePageChange = () => {
  loadRoleList()
}

onMounted(() => {
  loadRoleList()
})
</script>

<style scoped lang="scss">
.role-list {
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

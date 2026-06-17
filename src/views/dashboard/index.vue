<template>
  <div class="dashboard">
    <!-- 欢迎卡片 -->
    <el-card class="welcome-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>👋 欢迎回来，{{ userStore.userInfo?.nickname || '管理员' }}！</span>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="当前状态" span="2">在线</el-descriptions-item>
        <el-descriptions-item label="登录时间">
          {{ formatDate(userStore.userInfo?.lastLoginTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="用户 ID">{{ userStore.userInfo?.id }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总用户数</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-icon success">
              <UserFilled />
            </div>
            <div class="stat-value">{{ stats.userCount }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日访问</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-icon warning">
              <Avatar />
            </div>
            <div class="stat-value">{{ stats.visits }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>订单总额</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-icon danger">
              <Tickets />
            </div>
            <div class="stat-value">¥{{ stats.revenue }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统运行</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-icon info">
              <Odometer />
            </div>
            <div class="stat-value">{{ stats.uptime }}天</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
            </div>
          </template>
          <div ref="userTrendChart" class="chart-container" style="height: 300px;">
            <!-- 图表占位符 -->
            <el-empty description="数据加载中..." image-size="small" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>设备分布</span>
            </div>
          </template>
          <div ref="deviceChart" class="chart-container" style="height: 300px;">
            <!-- 图表占位符 -->
            <el-empty description="数据加载中..." image-size="small" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近操作记录 -->
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>最近操作</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item timestamp="10 分钟前" placement="top">
          <el-card>修改用户信息 - admin</el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="1 小时前" placement="top">
          <el-card>新增订单 - order_12345</el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2 小时前" placement="top">
          <el-card>系统备份完成</el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { UserFilled, Avatar, Tickets, Odometer } from '@element-plus/icons-vue'
import type { UserInfo } from '@/types'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()

interface Stats {
  userCount: number
  visits: number
  revenue: string
  uptime: string
}

const stats = ref<Stats>({
  userCount: 0,
  visits: 0,
  revenue: '128,450',
  uptime: '365'
})

const userTrendChart = ref<HTMLDivElement>()
const deviceChart = ref<HTMLDivElement>()

// 格式化时间
const formatDate = (date?: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 模拟加载图表数据
onMounted(() => {
  // TODO: 集成 ECharts 或其他图表库
  console.log('仪表盘已加载')
})
</script>

<style scoped lang="scss">
.dashboard {
  padding: 20px;

  .welcome-card {
    margin-bottom: 20px;

    :deep(.el-descriptions) {
      tr th,
      tr td {
        font-size: 14px !important;
      }
    }
  }

  .stats-cards {
    :deep(.el-card__header) {
      padding: 12px 16px;
      background-color: #f8f9fb;
      border-bottom: 1px solid #ebeef5;

      span {
        font-weight: 600;
        color: #606266;
      }
    }

    .stat-content {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 120px;

      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        margin-right: 16px;

        &.success {
          background-color: #f0f9eb;
          color: #67c23a;
        }

        &.warning {
          background-color: #fdf6ec;
          color: #e6a23c;
        }

        &.danger {
          background-color: #fef0f0;
          color: #f56c6c;
        }

        &.info {
          background-color: #ecf5ff;
          color: #409eff;
        }
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
    }
  }

  .charts {
    :deep(.el-card__header) {
      padding: 12px 16px;
      background-color: #f8f9fb;
      border-bottom: 1px solid #ebeef5;

      span {
        font-weight: 600;
        color: #606266;
      }
    }
  }
}
</style>

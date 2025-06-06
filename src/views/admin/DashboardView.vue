<template>
  <div class="dashboard container">
    <div class="page-header">
      <h2>控制面板</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待审核</span>
            </div>
          </template>
          <div class="card-content">
            <div class="statistic">
              <span class="number">{{ statistics.pending }}</span>
              <span class="label">条</span>
            </div>
            <el-button type="primary" @click="navigateToReviews('0')">查看详情</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>已批准</span>
            </div>
          </template>
          <div class="card-content">
            <div class="statistic">
              <span class="number">{{ statistics.approved }}</span>
              <span class="label">条</span>
            </div>
            <el-button type="success" @click="navigateToReviews('1')">查看详情</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>已拒绝</span>
            </div>
          </template>
          <div class="card-content">
            <div class="statistic">
              <span class="number">{{ statistics.rejected }}</span>
              <span class="label">条</span>
            </div>
            <el-button type="danger" @click="navigateToReviews('-1')">查看详情</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="recent-section">
      <h3>最近的审核</h3>
      <el-table :data="formatRecentReviews" stripe style="width: 100%">
        <el-table-column prop="creatorName" label="用户" width="120" />
        <el-table-column prop="name" label="标题" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" :class="'status-' + scope.row.status">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="scope">
            <el-button link type="primary" @click="viewDetail(scope.row.id)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 查看详情模态框 -->
    <el-dialog v-model="reviewModalVisible" :modal="false" destroy-on-close>
      <ReviewDetailModal :reviewId="currentReviewId" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewModalVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getReviews, getDashbordStatistics } from '@/api/review';
import type { Review } from '@/api/review';
import { dayjs } from 'element-plus';
import ReviewDetailModal from '@/components/review/ReviewDetailModal.vue';

const router = useRouter();
const recentReviews = ref<Review[]>([]);
const statistics = ref({
  pending: 0,
  approved: 0,
  rejected: 0
});

// 查看模态框相关
const reviewModalVisible = ref(false)
const currentReviewId = ref('')

onMounted(async () => {
  await fetchDashboardData();
});

const fetchDashboardData = async () => {
  try {
    // 获取最近的审核
    const response = await getReviews({ page: 1, pageSize: 5 });
    recentReviews.value = response.items;
    
    // 模拟获取统计数据
    // 实际项目中应通过API获取
    const dashbordStatistics = await getDashbordStatistics();

    statistics.value = {
      pending: dashbordStatistics.totalPendingReview,
      approved: dashbordStatistics.totalApproved,
      rejected: dashbordStatistics.totalRejected
    };
  } catch (error) {
    console.error('获取控制面板数据失败', error);
  }
};

// 计算属性：格式化日期
const formatRecentReviews = computed(() => {
  return recentReviews.value.map((review) => {
    return {
      ...review,
      createTime: formaDate(review.createTime),
      updateTime: formaDate(review.updateTime)
    }
  })
})

// 格式化日期
const formaDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    '-1': '已拒绝',
    '-2': '已作废',
    '0': '待审核',
    '1': '已批准',
    '2': '申请作废',
  };
  return statusMap[status] || status;
};

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    '0': 'warning',
    '1': 'success',
    '-1': 'danger'
  };
  return typeMap[status] || '';
};

const navigateToReviews = (status: string) => {
  router.push({ 
    path: '/admin/reviews',
    query: { status }
  });
};

const viewDetail = (id: string) => {
  reviewModalVisible.value = true;
  currentReviewId.value = id;
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.statistic {
  margin-bottom: 20px;
  text-align: center;
}

.statistic .number {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
}

.statistic .label {
  font-size: 16px;
  color: #909399;
  margin-left: 5px;
}

.recent-section {
  margin-top: 30px;
}

.recent-section h3 {
  margin-bottom: 20px;
}
</style> 
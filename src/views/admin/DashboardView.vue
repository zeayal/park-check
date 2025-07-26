<template>
  <div v-if="loading">
    <el-skeleton :rows="3" :animated="true" />
  </div>

  <div v-else class="dashboard container">
    <div class="page-user">
      <!-- <h3>用户数据</h3> -->
      <el-button plain @click="freshData" class="page-user-button"
        >刷新用户数据</el-button
      >
      <p>
        <text class="page-user-text"
          >总用户数：{{ statistics.totalUsers }}</text
        >
        <text class="page-user-text"
          >今日新增：{{
            statistics.dailyNewUsersInLastSevenDays?.[0]?.count
          }}</text
        >
      </p>

      <!-- 用户数据 -->
      <div class="page-user-table">
        <h5>过去7天新增用户数</h5>
      </div>
      <div>
        <el-table
          :data="statistics.dailyNewUsersInLastSevenDays"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="date" label="日期" width="180">
          </el-table-column>
          <el-table-column prop="count" label="当日新增" width="180">
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 审核管理 -->
    <div class="page-check">
      <h3>审核管理</h3>
    </div>

    <el-row :gutter="20">
      <!-- 新增待审核 -->
      <el-col :xs="24" :md="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>新增营地待审核</span>
            </div>
          </template>
          <div class="card-content">
            <div class="statistic">
              <span class="number">{{ statistics.pending }}</span>
              <span class="label">条</span>
            </div>
            <el-button type="primary" @click="navigateToReviews('0')"
              >查看详情</el-button
            >
          </div>
        </el-card>
      </el-col>

      <!-- 修改待审核 -->
      <!-- <el-col :span="6">
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
            <el-button type="danger" @click="navigateToReviews('-1')"
              >查看详情</el-button
            >
          </div>
        </el-card>
      </el-col> -->

      <!-- 打卡待审核 -->
      <!-- <el-col :span="6">
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
            <el-button type="danger" @click="navigateToReviews('-1')"
              >查看详情</el-button
            >
          </div>
        </el-card>
      </el-col> -->

      <!-- 已批准营地 -->
      <el-col :xs="24" :md="8">
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
            <el-button type="success" @click="navigateToReviews('1')"
              >查看详情</el-button
            >
          </div>
        </el-card>
      </el-col>

      <!-- 新增已拒绝 -->
      <el-col :xs="24" :md="8">
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
            <el-button type="danger" @click="navigateToReviews('-1')"
              >查看详情</el-button
            >
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
            <el-tag
              :type="getStatusType(scope.row.status)"
              :class="'status-' + scope.row.status"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
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
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getReviews, getDashbordStatistics } from "@/api/review";
import type { Review } from "@/api/review";
import { dayjs } from "element-plus";
import ReviewDetailModal from "@/components/review/ReviewDetailModal.vue";

const router = useRouter();
const recentReviews = ref<Review[]>([]);
const loading = ref(true);
const statistics = ref<any>({
  pending: 0,
  approved: 0,
  rejected: 0,
  dailyNewUsersInLastSevenDays: [],
  totalUsers: 0,
});

// 查看模态框相关
const reviewModalVisible = ref(false);
const currentReviewId = ref("");

onMounted(async () => {
  await fetchDashboardData();
});

const fetchDashboardData = async () => {
  try {
    // 获取最近的审核
    loading.value = true;
    const response = await getReviews({ page: 1, pageSize: 5 });
    recentReviews.value = response.items;

    // 获取数据
    const dashbordStatistics = await getDashbordStatistics();

    statistics.value = {
      pending: dashbordStatistics.totalPendingReview,
      approved: dashbordStatistics.totalApproved,
      rejected: dashbordStatistics.totalRejected,
      dailyNewUsersInLastSevenDays:
        dashbordStatistics.dailyNewUsersInLastSevenDays.reverse(),
      totalUsers: dashbordStatistics.totalUsers,
    };
  } catch (error) {
    console.error("获取控制面板数据失败", error);
  } finally {
    loading.value = false;
  }
};

// 点击刷新数据
const freshData = async () => {
  try {
    loading.value = true;
    const res = await getDashbordStatistics();
    statistics.value = {
      pending: res.totalPendingReview,
      approved: res.totalApproved,
      rejected: res.totalRejected,
      dailyNewUsersInLastSevenDays: res.dailyNewUsersInLastSevenDays.reverse(),
      totalUsers: res.totalUsers,
    };
  } catch (error) {
    console.error("更新数据失败", error);
  } finally {
    loading.value = false;
  }
};

// 计算属性：格式化日期
const formatRecentReviews = computed(() => {
  return recentReviews.value.map((review) => {
    return {
      ...review,
      createTime: formaDate(review.createTime),
      updateTime: formaDate(review.updateTime),
    };
  });
});

// 格式化日期
const formaDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    "-1": "已拒绝",
    "-2": "已作废",
    "0": "待审核",
    "1": "已批准",
    "2": "申请作废",
  };
  return statusMap[status] || status;
};

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    "0": "warning",
    "1": "success",
    "-1": "danger",
  };
  return typeMap[status] || "";
};

const navigateToReviews = (status: string) => {
  console.log("当前状态：", status);
  router.push({
    path: "/admin/reviews",
    query: { status },
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

.page-user {
  margin-bottom: 20px;
}

.page-user p {
  margin: 10px 0;
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.page-user-button {
  font-size: 16px;
  font-weight: 700;
}

.page-user-text {
  margin-right: 20px;
}

.page-user-table h5 {
  margin-bottom: 5px;
}

.page-check {
  margin-bottom: 20px;
}

.statistic {
  margin-bottom: 20px;
  text-align: center;
}

.statistic .number {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
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

.user-total,
.today-new,
.today-active {
  margin-right: 20px;
  font-size: 12px;
  color: #909399;
  font-weight: 600;
}
</style>

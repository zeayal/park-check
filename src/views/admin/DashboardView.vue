<template>
  <div v-if="loading">
    <el-skeleton :rows="3" :animated="true" />
  </div>

  <div v-else class="dashboard container">
    <div class="page-user">
      <p>
        <text class="page-user-text"
          >总用户数：{{ statistics.totalUsers }}</text
        >
        <text class="page-user-text"
          >今日新增：{{
            statistics.dailyNewUsersInLastSevenDays?.[0]?.count
          }}</text
        >
        <text class="page-user-text"
          >总营地数： {{ statistics.totalAddApproved }}
        </text>
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

      <el-row class="page-action-button">
        <el-col :span="6" class="card-column">
          <el-button type="primary" plain @click="freshData"
            >刷新数据</el-button
          >
        </el-col>

        <el-col :span="6" class="card-column">
          <el-badge
            :value="statistics.totalAddPendingReview"
            class="item"
            v-if="statistics.totalAddPendingReview > 0"
          >
            <el-button
              type=""
              @click="navigateToReviews('/admin/reviews/add', '0')"
              >新增审核</el-button
            >
          </el-badge>
          <el-button
            type=""
            @click="navigateToReviews('/admin/reviews/add', '0')"
            v-else
            >新增审核</el-button
          >
        </el-col>

        <el-col :span="6" class="card-column">
          <el-badge
            :value="statistics.totalEditPendingReview"
            class="item"
            v-if="statistics.totalEditPendingReview > 0"
          >
            <el-button @click="navigateToReviews('/admin/reviews/edit', '0')"
              >修改审核</el-button
            >
          </el-badge>
          <el-button
            type=""
            @click="navigateToReviews('/admin/reviews/edit', '0')"
            v-else
            >修改审核</el-button
          >
        </el-col>

        <el-col :span="6" class="card-column">
          <el-badge
            :value="statistics.totalCommentPendingReview"
            class="item"
            v-if="statistics.totalCommentPendingReview > 0"
          >
            <el-button @click="navigateToReviews('/admin/reviews/comment', '0')"
              >打卡审核</el-button
            >
          </el-badge>
          <el-button
            type=""
            @click="navigateToReviews('/admin/reviews/comment', '0')"
            v-else
            >打卡审核</el-button
          >
        </el-col>
      </el-row>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import type { Review } from "@/api/review";
import { dayjs } from "element-plus";
import ReviewDetailModal from "@/components/review/ReviewDetailModal.vue";
import { useReviewStore } from "@/stores/review";
import MonitorView from "./MonitorView.vue";

const router = useRouter();
const reviewStore = useReviewStore();
const recentReviews = ref<Review[]>([]);
const loading = computed(() => reviewStore.loading);
const statistics = computed(() => reviewStore.dashboardData);

// 查看模态框相关
const reviewModalVisible = ref(false);
const currentReviewId = ref("");

// 点击刷新数据
const freshData = async () => {
  await reviewStore.refreshDashboard();
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

const navigateToReviews = (path: string, status: string) => {
  console.log("当前状态：", status);
  router.push({
    path,
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
  margin-bottom: 10px;
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
  margin-top: 10px;
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

/* 仅在手机端(xs)设置上下间距 */
@media screen and (max-width: 430px) {
  .card-column {
    font-size: 12px;
  }
}

.page-action-button {
  margin-top: 10px;
}
</style>

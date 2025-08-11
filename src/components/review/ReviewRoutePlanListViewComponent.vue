<template>
  <div class="review-list">
    <el-row :gutter="10" class="page-header">
      <el-col :span="24" :md="12">
        <div class="status-filter-wrapper">
          <el-radio-group v-model="currentStatus" @change="handleStatusChange">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="0">待审核</el-radio-button>
            <el-radio-button label="1">已批准</el-radio-button>
            <el-radio-button label="-1">已拒绝</el-radio-button>
            <el-radio-button label="-2">已作废</el-radio-button>
          </el-radio-group>
        </div>
      </el-col>
      <el-col :span="24" :md="12">
        <el-row :gutter="10">
          <el-col :span="24" :md="12" class="search-wrapper">
            <!-- <h2>{{ title }}</h2> -->
            <el-input v-model="input" clearable :prefix-icon="Search" style="width: 340px; height: 30px"
              placeholder="请输入标题进行搜索" @change="handleOnChange" />
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <!--  show-overflow-tooltip -->
    <el-table v-loading="loading" :data="formatReviews" height="75vh" style="width: 100%" border show-overflow-tooltip
      preserve-expanded-content>

      <el-table-column type="expand">
        <template #default="props">
          <div class="expand-content">
            <el-table :data="props.row.points" :border="true">
              <el-table-column label="排序" prop="order" width="80" />
              <el-table-column label="途经点名称" prop="name" width="280" />
              <el-table-column label="经度longitude" prop="longitude" width="180" />
              <el-table-column label="纬度latitude" prop="latitude" width="180" />
              <el-table-column label="地址" prop="address" />
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="80" class="single" />
      <el-table-column prop="name" label="标题" width="280" />
      <el-table-column prop="description" label="描述" width="320" />
      <el-table-column prop="color" label="颜色" width="80" class="single">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <div :style="{ width: '10px', height: '10px', backgroundColor: scope.row.color }"></div>
            <span style="margin-left: 10px">{{ scope.row.color }}</span>
          </div>
        </template>
      </el-table-column>
      <!-- 在移动端隐藏部分列 -->
      <el-table-column prop="status" label="状态" width="100" class="desktop-only">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)" :class="'status-' + scope.row.status">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" class="desktop-only" />

      <el-table-column prop="updateTime" label="更新时间" width="180" class="desktop-only" />

      <el-table-column fixed="right" label="操作" :width="operationColumnWidth">
        <template #default="scope">
          <div class="table-actions desktop-only">

            <el-button v-if="scope.row.status === 0" size="small" link type="primary"
              @click="handleApprove(scope.row.id)">
              批准
            </el-button>

            <el-button v-if="scope.row.status === 1" size="small" link type="danger"
              @click="handleInvalidate(scope.row.id)">
              作废
            </el-button>


            <el-button v-if="scope.row.status === -2" size="small" link type="success"
              @click="handleInvalidateToNormal(scope.row.id)">
              恢复
            </el-button>

          </div>
          <div class="table-actions mobile-only">
            <el-dropdown trigger="click">
              <el-button size="small" type="primary">
                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="scope.row.status === 0"
                    @click="handleApprove(scope.row.id)">批准</el-dropdown-item>

                  <el-dropdown-item v-if="scope.row.status === 1"
                    @click="handleInvalidate(scope.row.id)">作废</el-dropdown-item>

                  <el-dropdown-item v-if="scope.row.status === -2"
                    @click="handleInvalidateToNormal(scope.row.id)">恢复</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[100, 200, 500, 1000]"
        background :layout="paginationLayout" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>



  </div>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import { ref, onMounted, watch, computed, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  type Review,
  getRoutePlanList,
  approveRoutePlanReviewItem,
  invalidateRoutePlanReviewItem,
  invalidateToNormalRoutePlanReviewItem
} from "@/api/review";
import dayjs from "dayjs";
import { ArrowDown } from "@element-plus/icons-vue";

const input = ref("");

const emit = defineEmits<{
  (e: "update:loading", value: boolean): void;
}>();

const router = useRouter();
const route = useRoute();

// 状态过滤
const currentStatus = ref("");
const starValue = ref(0);

// 响应式布局相关
const isMobile = ref(window.innerWidth <= 768);
const paginationLayout = computed(() =>
  isMobile.value
    ? "total, prev, pager, next"
    : "total, sizes, prev, pager, next, jumper"
);
const operationColumnWidth = computed(() =>
  isMobile.value ? "60px" : "200px"
);

// 搜索相关
const searchName = ref("");
// 分页相关
const currentPage = ref(1);
const pageSize = ref(100);
const total = ref(0);
const loading = ref(false);

const actionLoading = ref(false);

// 计算属性
const reviews = ref<Review[]>([]);

onMounted(() => {
  // 监听窗口大小变化
  window.addEventListener("resize", handleResize);

  // 从URL获取状态参数
  if (route.query.status) {
    currentStatus.value = route.query.status as string;
  }
  fetchReviews();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

// 处理窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};


// 监听状态变化刷新数据
watch(currentStatus, (newStatus) => {
  currentPage.value = 1; // 切换状态时重置为第一页
  router.push({ query: newStatus ? { status: newStatus } : {} });
});



const handleOnChange = (value: string) => {
  const val = value?.trim() || "";
  searchName.value = val;
  fetchReviews();
  // console.log("handleOnChange, ", val);
};

// 获取审核列表
const fetchReviews = async () => {
  loading.value = true;
  emit("update:loading", true);
  // console.log("searchName", searchName.value);
  try {
    // 构建请求参数
    const params = {
      searchName: searchName.value,
      starValue: starValue.value,
      statusList: currentStatus.value ? currentStatus.value : "",
      page: currentPage.value,
      pageSize: pageSize.value,
    };

    // 从后端获取数据
    const response = await getRoutePlanList(params);

    if (response) {
      reviews.value = response.items || [];
      total.value = response.total || 0;
    } else {
      reviews.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("获取审核列表失败", error);
    ElMessage.error("获取审核列表失败");
  } finally {
    loading.value = false;
    emit("update:loading", false);
  }
};

// 计算属性：格式化日期
const formatReviews = computed(() => {
  return reviews.value.map((review) => ({
    ...review,
    createTime: formatDate(review.createTime),
    updateTime: formatDate(review.updateTime),
  }));
});

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};

// 状态文本
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

// 状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    "0": "warning",
    "1": "success",
    "-1": "danger",
    "-2": "info",
  };
  return typeMap[status] || "";
};

// 处理页面变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchReviews();
};

// 处理每页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchReviews();
};

// 处理状态变化
const handleStatusChange = (val: string) => {
  currentStatus.value = val;
  fetchReviews();
};


// 批准操作
const handleApprove = (id: string) => {
  ElMessageBox.confirm("确定要批准该审核吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      actionLoading.value = true;
      try {
        const res = await approveRoutePlanReviewItem(id);
        if (res.code === 0) {
          ElMessage.success("审核已批准");
          fetchReviews();
        } else {
          ElMessage.error(res.msg || "批准失败");
        }
      } catch (error) {
        ElMessage.error("批准失败");
      } finally {
        actionLoading.value = false;
      }
    })
    .catch(() => {
      ElMessage.info("已取消批准");
    });
};


// 作废操作
const handleInvalidate = (id: string) => {
  ElMessageBox.confirm("确定要作废该审核吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      actionLoading.value = true;
      try {
        const res = await invalidateRoutePlanReviewItem(id);
        if (res.code === 0) {
          ElMessage.success("已作废");
          fetchReviews();
        } else {
          ElMessage.error(res.msg || "作废失败");
        }
      } catch (error) {
        ElMessage.error("作废失败");
      } finally {
        actionLoading.value = false;
      }
    })
    .catch(() => {
      ElMessage.info("已取消作废");
    });
};


// 恢复操作
const handleInvalidateToNormal = (id: string) => {
  ElMessageBox.confirm("确定要恢复该审核吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    actionLoading.value = true;
    try {
      const res = await invalidateToNormalRoutePlanReviewItem(id);
      if (res.code === 0) {
        ElMessage.success("已恢复");
        fetchReviews();
      } else {
        ElMessage.error(res.msg || "恢复失败");
      }
    } catch (error) {
      ElMessage.error("恢复失败");
    } finally {
      actionLoading.value = false;
    }
  }).catch(() => {
    ElMessage.info("已取消恢复");
  });
};


</script>

<style scoped>
.review-list {
  height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 6px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
}

.status-filter-wrapper {
  margin-top: 0;

  /* 默认在同一行 */
  .el-radio-group {
    flex-wrap: nowrap;
  }
}

.el-table {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

.table-actions .el-button {
  margin-left: 0;
  /* 消除默认的左边距 */
  margin-right: 8px;
  /* 增加右边距 */
}

/* 响应式样式 */
@media screen and (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header h2 {
    margin-bottom: 5px;
    font-size: 15px;
  }

  .status-filter-wrapper {
    width: 100%;
    /* 占据整行 */
  }

  .el-radio-group {
    display: flex;
  }

  .el-radio-button {
    flex: 1;
    /* 均分空间 */
    margin-bottom: 5px;
  }

  /* 隐藏桌面端特有的列 */
  .el-table .desktop-only {
    display: none;
  }

  .el-table-column[prop="id"] {
    width: 60px !important;
    /* 调整ID列宽度 */
  }

  .el-table-column[prop="name"] {
    min-width: 100px !important;
    /* 调整标题列最小宽度 */
  }

  .table-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    /* 按钮之间的间距 */
  }

  .table-actions .el-button {
    margin: 0;
    /* 重置margin */
    padding: 5px 8px;
    /* 调整按钮内边距 */
    font-size: 0.8em;
    /* 调整字体大小 */
  }

  .pagination-container {
    justify-content: center;
  }

  .mobile-only {
    display: block;
  }

  .table-actions.mobile-only .el-button {
    padding: 4px 6px;
    /* 进一步缩小按钮内边距 */
    font-size: 0.7em;
    /* 进一步缩小字体 */
    margin-left: -6px;
  }
}

@media screen and (min-width: 769px) {
  .mobile-only {
    display: none;
  }
}

@media screen and (max-width: 480px) {
  .page-header h2 {
    font-size: 18px;
  }

  .el-radio-button {
    font-size: 0.8em;
  }
}

.search-wrapper {
  display: flex;
  gap: 20px;
}

.page-header-left {
  display: flex;
  gap: 10px;
}

.star-filter-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.expand-content {
  padding: 0 10px;
}
</style>

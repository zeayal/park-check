<template>
  <div class="review-list container">
    <div class="page-header">
      <h2>审核管理</h2>
      <el-radio-group v-model="currentStatus" @change="handleStatusChange">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label=0>待审核</el-radio-button>
        <el-radio-button label=1>已批准</el-radio-button>
        <el-radio-button label=-1>已拒绝</el-radio-button>
      </el-radio-group>
    </div>

    <el-table v-loading="loading" :data="formatReviews" height="400" style="width: 100%" border show-overflow-tooltip>
      <el-table-column prop="id" label="ID" width="80" class="single" />
      <el-table-column prop="creatorName" label="用户" width="120" />
      <el-table-column prop="name" label="标题" min-width="200" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)" :class="'status-' + scope.row.status">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column fixed="right" label="操作" width="200">
        <template #default="scope">
          <div class="table-actions">
            <el-button size="small" link type="primary" @click="viewDetail(scope.row.id)">
              查看
            </el-button>
            <el-button v-if="scope.row.status === 0" size="small" link type="success"
              @click="handleApprove(scope.row.id)">
              批准
            </el-button>
            <el-button v-if="scope.row.status === 0" size="small" link type="danger"
              @click="handleReject(scope.row.id)">
              拒绝
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[100, 200, 500, 1000]"
        background layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>

    <!-- 查看详情模态框 -->
    <el-dialog v-model="reviewModalVisible" :modal="false" destroy-on-close>
      <ReviewDetailModal :reviewId="currentReviewId" @close-modal="reviewModalVisible = false"/>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewModalVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 拒绝对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="30%">
      <el-form :model="rejectForm" ref="rejectFormRef">
        <el-form-item prop="reason" label="拒绝原因" :rules="[{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="请输入拒绝原因"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject" :loading="actionLoading">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useReviewStore } from '@/stores/review';
import type { FormInstance } from 'element-plus';
import { getReviews, type Review } from '@/api/review';
import dayjs from 'dayjs';
import ReviewDetailModal from '@/components/review/ReviewDetailModal.vue';

const router = useRouter();
const route = useRoute();
const reviewStore = useReviewStore();

// 状态过滤
const currentStatus = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(100);
const total = ref(0);
const loading = ref(false);

// 查看模态框相关
const reviewModalVisible = ref(false);
const currentReviewId = ref('');

// 拒绝对话框相关
const rejectDialogVisible = ref(false);
const rejectForm = ref({ reason: '', id: 0 });
const rejectFormRef = ref<FormInstance>();
const actionLoading = ref(false);

// 计算属性
const reviews = ref<Review[]>([]);

onMounted(() => {
  // 从URL获取状态参数
  if (route.query.status) {
    currentStatus.value = route.query.status as string;
  }
  fetchReviews();
});

// 监听状态变化刷新数据
watch(currentStatus, (newStatus) => {
  currentPage.value = 1; // 切换状态时重置为第一页
  router.push({ query: newStatus ? { status: newStatus } : {} });
});

// 获取审核列表
const fetchReviews = async () => {
  loading.value = true;
  try {
    
    // 构建请求参数
    const params = {
      statusList: currentStatus.value ? currentStatus.value : '',
      page: currentPage.value,
      pageSize: pageSize.value,
    };


    // 从后端获取数据
    const response = await getReviews(params);
    reviews.value = response.items;
    total.value = response.total;

  } catch (error) {
    console.error('获取审核列表失败', error);
    ElMessage.error('获取审核列表失败');
  } finally {
    loading.value = false;
  }
};

// 计算属性：格式化日期
const formatReviews = computed(() => {
  return reviews.value.map((review) => {
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

// 状态文本
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

// 状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    '0': 'warning',
    '1': 'success',
    '-1': 'danger'
  };
  return typeMap[status] || '';
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

// 查看详情
const viewDetail = (id: string) => {
  currentReviewId.value = id;
  reviewModalVisible.value = true;
};

// 批准操作
const handleApprove = (id: number) => {
  ElMessageBox.confirm('确定要批准该审核吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      actionLoading.value = true;
      await reviewStore.approveReviewItem(id);
      ElMessage.success('审核已批准');
      fetchReviews();
    } catch (error) {
      ElMessage.error('操作失败');
    } finally {
      actionLoading.value = false;
    }
  }).catch(() => {});
};

// 拒绝操作
const handleReject = (id: number) => {
  rejectForm.value = { reason: '', id };
  rejectDialogVisible.value = true;
};

// 确认拒绝
const confirmReject = async () => {
  if (!rejectFormRef.value) return;
  
  await rejectFormRef.value.validate(async (valid) => {
    if (valid) {
      actionLoading.value = true;
      try {
        await reviewStore.rejectReviewItem(rejectForm.value.id, rejectForm.value.reason);
        ElMessage.success('审核已拒绝');
        rejectDialogVisible.value = false;
        fetchReviews();
      } catch (error) {
        ElMessage.error('操作失败');
      } finally {
        actionLoading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.single {
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid #ccc;
  padding: 5px;
}
</style> 
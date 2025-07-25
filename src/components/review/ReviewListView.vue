<template>
  <div class="review-list">
    <div class="page-header">
      <div class="search-wrapper">
        <h2>{{ title }}</h2>
        <el-input
          v-model="input"
          clearable
          :prefix-icon="Search"
          style="width: 240px"
          placeholder="请输入标题进行搜索"
          @change="handleOnChange"
        />
      </div>
      <div class="status-filter-wrapper">
        <el-radio-group v-model="currentStatus" @change="handleStatusChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="0">待审核</el-radio-button>
          <el-radio-button label="1">已批准</el-radio-button>
          <el-radio-button label="-1">已拒绝</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="formatReviews"
      height="75vh"
      style="width: 100%"
      border
      show-overflow-tooltip
    >
      <el-table-column prop="id" label="ID" width="80" class="single" />
      <el-table-column prop="name" label="标题" min-width="150" />
      <el-table-column
        prop="address"
        label="地址"
        width="120"
        class="desktop-only"
      />
      <el-table-column
        prop="description"
        label="营地介绍"
        width="180"
        class="desktop-only"
      />
      <!-- 在移动端隐藏部分列 -->
      <el-table-column
        prop="status"
        label="状态"
        width="100"
        class="desktop-only"
      >
        <template #default="scope">
          <el-tag
            :type="getStatusType(scope.row.status)"
            :class="'status-' + scope.row.status"
          >
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180"
        class="desktop-only"
      />

      <el-table-column
        prop="updateTime"
        label="更新时间"
        width="180"
        class="desktop-only"
      />

      <el-table-column fixed="right" label="操作" :width="operationColumnWidth">
        <template #default="scope">
          <div class="table-actions desktop-only">
            <el-button
              size="small"
              link
              type="primary"
              @click="handleView(scope.row.id)"
            >
              查看
            </el-button>
            <el-button
              v-if="scope.row.status === 1 || scope.row.status === 0"
              size="small"
              link
              type="warning"
              @click="handleEdit(scope.row.id)"
            >
              修改
            </el-button>
            <el-button
              v-if="scope.row.status === 0"
              size="small"
              link
              type="success"
              @click="handleApprove(scope.row.id)"
            >
              批准
            </el-button>
            <el-button
              v-if="scope.row.status === 0"
              size="small"
              link
              type="danger"
              @click="handleReject(scope.row.id)"
            >
              拒绝
            </el-button>
          </div>
          <div class="table-actions mobile-only">
            <el-dropdown trigger="click">
              <el-button size="small" type="primary">
                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleView(scope.row.id)"
                    >查看</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="scope.row.status === 1 || scope.row.status === 0"
                    @click="handleEdit(scope.row.id)"
                    >修改</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="scope.row.status === 0"
                    @click="handleApprove(scope.row.id)"
                    >批准</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="scope.row.status === 0"
                    @click="handleReject(scope.row.id)"
                    >拒绝</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[100, 200, 500, 1000]"
        background
        :layout="paginationLayout"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 查看详情模态框 -->
    <el-dialog
      v-model="reviewModalVisible"
      :modal="false"
      destroy-on-close
      :width="dialogWidth"
    >
      <ReviewDetailModal
        :reviewId="currentReviewId"
        @close-modal="reviewModalVisible = false"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewModalVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改详情模态框 -->

    <el-dialog title="修改详情" v-model="editFormVisible" destroy-on-close>
      <el-form :model="editForm" label-position="right" label-width="auto">
        <el-form-item label="营地名称">
          <el-input v-model="editForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="营地位置">
          纬度latitude<el-input
            v-model="editForm.latitude"
            autocomplete="off"
          ></el-input>
          经度longitude<el-input
            v-model="editForm.longitude"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="详情描述">
          <el-input type="textarea" v-model="editForm.description"></el-input>
        </el-form-item>
        <el-form-item label="是否收费">
          <el-radio-group v-model="editForm.isCharged">
            <el-radio :value="true">收费</el-radio>
            <el-radio :value="false">免费</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否有厕所">
          <el-radio-group v-model="editForm.hasToilet">
            <el-radio :value="true">有</el-radio>
            <el-radio :value="false">无</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否可以接水">
          <el-radio-group v-model="editForm.hasWater">
            <el-radio :value="true">可以</el-radio>
            <el-radio :value="false">不可以</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否有充电桩">
          <el-radio-group v-model="editForm.hasElectricity">
            <el-radio :value="true">有</el-radio>
            <el-radio :value="false">无</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否可以搭帐篷">
          <el-radio-group v-model="editForm.canPitchTent">
            <el-radio :value="true">可以</el-radio>
            <el-radio :value="false">不可以</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否五星营地">
          <el-radio-group v-model="editForm.isStarCamp">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!-- https://unistar.icu/api/fs-service/uploadFileToOSS -->
      <!-- https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15 -->

      <!-- 修改图片 -->
      <el-upload
        v-model:file-list="fileList"
        action="https://unistar.icu/api/fs-service/uploadFileToOSS"
        list-type="picture-card"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :auto-upload="true"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submmitEdit">提交修改</el-button>
      </div>
    </el-dialog>

    <!-- 拒绝对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝原因"
      :width="dialogWidth"
    >
      <el-form :model="rejectForm" ref="rejectFormRef">
        <el-form-item
          prop="reason"
          label="拒绝原因"
          :rules="[
            { required: true, message: '请输入拒绝原因', trigger: 'blur' },
          ]"
        >
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmReject"
            :loading="actionLoading"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import { ref, onMounted, watch, computed, onUnmounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useReviewStore } from "@/stores/review";
import type { FormInstance } from "element-plus";
import {
  getReviews,
  type Review,
  getReviewById,
  adminEditDetail,
} from "@/api/review";
import dayjs from "dayjs";
import ReviewDetailModal from "@/components/review/ReviewDetailModal.vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { Plus } from "@element-plus/icons-vue";
const INIT_FORM_DATA = {
  id: "",
  name: "",
  description: "",
  isStarCamp: false,
  latitude: null,
  longitude: null,
  images: [] as string[],
  isCharged: false,
  hasToilet: false,
  hasWater: false,
  hasElectricity: false,
  canPitchTent: false,
  address: "",
};
const input = ref("");
const props = defineProps<{
  mode: "add";
  title: string;
}>();

const emit = defineEmits<{
  (e: "update:loading", value: boolean): void;
}>();

const router = useRouter();
const route = useRoute();
const reviewStore = useReviewStore();

// 状态过滤
const currentStatus = ref("");

// 响应式布局相关
const isMobile = ref(window.innerWidth <= 768);
const tableHeight = "auto";
const paginationLayout = computed(() =>
  isMobile.value
    ? "total, prev, pager, next"
    : "total, sizes, prev, pager, next, jumper"
);
const dialogWidth = computed(() => (isMobile.value ? "90%" : "30%"));
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

// 查看模态框相关
const reviewModalVisible = ref(false);
const currentReviewId = ref("");

// 修改详情模态框相关
const editFormVisible = ref(false);
// 用于el-upload的文件列表
const fileList = ref([]);

const editForm = reactive(INIT_FORM_DATA);

// 拒绝对话框相关
const rejectDialogVisible = ref(false);
const rejectForm = ref({ reason: "", id: "" });
const rejectFormRef = ref<FormInstance>();
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

// 监听修改窗口关闭，重置form表单数据
watch(editFormVisible, (newStatus) => {
  editForm.id = "";
  editForm.name = "";
  editForm.description = "";
  editForm.isStarCamp = false;
  editForm.latitude = null;
  editForm.longitude = null;
  editForm.images = [] as string[];
  editForm.isCharged = false;
  editForm.hasToilet = false;
  editForm.hasWater = false;
  editForm.hasElectricity = false;
  editForm.canPitchTent = false;
  editForm.address = "";
});

const handleOnChange = (value: string) => {
  const val = value?.trim() || "";
  searchName.value = val;
  fetchReviews();
  console.log("handleOnChange, ", val);
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
      statusList: currentStatus.value ? currentStatus.value : "",
      page: currentPage.value,
      pageSize: pageSize.value,
    };

    // 从后端获取数据
    const response = await getReviews(params);

    // console.log("response1111", response);

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

// 查看详情
const handleView = (id: string) => {
  currentReviewId.value = id;
  reviewModalVisible.value = true;
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
        const res = await reviewStore.approveReviewItem(id);
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

// 修改营地
// 1.获取营地详情并展示在form表单
const handleEdit = async (id: string) => {
  editFormVisible.value = true;
  // 获取营地详情
  try {
    const { data } = await getReviewById(id);

    // 复制数据到表单
    const { images, ...restData } = data;
    Object.assign(editForm, restData);
    // 处理图片
    editForm.images = images.map((image: any) => image.serverFilename);

    // 转换图片格式以适配up-load
    fileList.value = images.map((image: any) => ({
      uid: image.serverFilename || `temp_${Date.now}`,
      name: "image",
      url: image.previewUrl,
      status: "success",
      response: image,
    }));
  } catch (error) {
    console.error("获取详情失败", error);
    ElMessage.error("获取详情失败");
  }
};

// 2.提交修改
const submmitEdit = async (EditedDetail: object) => {
  try {
    actionLoading.value = true;
    const res = await adminEditDetail(editForm);
    if (res.code === 0) {
      ElMessage.success("修改成功");
      editFormVisible.value = false;
      // 刷新页面
      fetchReviews();
    } else {
      ElMessage.error("修改失败");
      console.log(res.msg);
    }
  } catch (error) {
    console.log(error);
    ElMessage.error("修改失败");
  } finally {
    actionLoading.value = false;
  }
};

// 3.处理图片删除
const handleRemove = (file: any, fileList: any[]) => {
  console.log("删除图片:", file);
  file.status = "delete";
  // 更新表单中的图片URL数组
  updateImagesArray();
};

// 处理上传成功
const handleSuccess = (response: any, file: any, fileList: any[]) => {
  console.log("上传成功:", response);

  if (response.code === 0 && response.data?.filename) {
    // 从响应中获取文件名并构建完整URL
    const filename = response.data.filename;

    // 更新文件对象
    // file.url = filename;
    file.status = "success";
    file.response = {
      serverFilename: filename,
    };

    ElMessage.success("图片上传成功");
  } else {
    file.status = "error";
    ElMessage.error("图片上传失败: " + response.msg || "未知错误");
  }

  // 更新表单中的图片URL数组
  updateImagesArray();
};

// 更新editForm.images数组
const updateImagesArray = () => {
  editForm.images = fileList.value
    .filter((file: any) => file.status === "success") // 只保留成功上传的图片
    .map((file: any) => file.response.serverFilename); // 获取图片URL
  // console.log("当前图片URL列表:", editForm.images);
};

// 拒绝操作
const handleReject = (id: string) => {
  rejectDialogVisible.value = true;
  rejectForm.value.id = id;
  if (rejectFormRef.value) {
    rejectFormRef.value.resetFields();
  }
};

const confirmReject = async () => {
  if (!rejectFormRef.value) return;

  await rejectFormRef.value.validate(async (valid) => {
    if (valid) {
      actionLoading.value = true;
      try {
        const res = await reviewStore.rejectReviewItem(
          rejectForm.value.id,
          rejectForm.value.reason
        );
        if (res.code === 0) {
          ElMessage.success("审核已拒绝");
          rejectDialogVisible.value = false;
          fetchReviews();
        } else {
          ElMessage.error(res.msg || "拒绝失败");
        }
      } catch (error) {
        ElMessage.error("拒绝失败");
      } finally {
        actionLoading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.review-list {
  height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  /* 允许换行 */
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
}

.status-filter-wrapper {
  margin-top: 0;
  /* 默认在同一行 */
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
  .review-list {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header h2 {
    margin-bottom: 10px;
    font-size: 20px;
  }

  .status-filter-wrapper {
    width: 100%;
    /* 占据整行 */
  }

  .el-radio-group {
    display: flex;
    width: 100%;
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
</style>

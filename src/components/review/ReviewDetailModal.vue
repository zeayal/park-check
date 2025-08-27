<template>
    <div class="review-detail-modal">
        <div class="page-header">
            <h2>审核详情</h2>
            <div>
                <el-button v-if="Number(review?.status) == 0" type="success" @click="handleApprove"
                    :loading="approveActionLoading">
                    批准
                </el-button>
                <el-button v-if="Number(review?.status) == 0" type="danger" @click="handleReject"
                    :loading="rejectActionLoading">
                    拒绝
                </el-button>
            </div>
        </div>

        <el-card v-if="review">
            <template #header>
                <div class="card-header">
                    <span>{{ review.name }}</span>
                    <el-tag :type="getStatusType(review.status)" :class="'status-' + review.status">
                        {{ getStatusText(review.status) }}
                    </el-tag>
                </div>
            </template>

            <div class="review-info">
                <p><strong>用户：</strong> {{ review.creatorName }}</p>
                <p><strong>创建时间：</strong> {{ formatDate(review.createTime) }}</p>
                <p><strong>更新时间：</strong> {{ formatDate(review.updateTime) }}</p>
            </div>

            <div class="review-content">
                <h3>详情</h3>
                <div class="content-box">
                    <!-- 公共信息 -->
                    <p><strong>营地描述：</strong> {{ review.description }}</p><br>
                    <p><strong>地址：</strong> {{ review.address }}</p>
                    <p><strong>平均星级：</strong> {{ review.averageScore || '-' }}</p>
                    <p><strong>GPS经度：</strong> {{ review.longitude }}</p>
                    <p><strong>GPS纬度：</strong> {{ review.latitude }}</p>
                    <!-- 点击按钮打开腾讯地图 -->
                    <el-button type="info" plain @click="handleOpenMap">在地图中查看</el-button>

                    <!-- 营地 -->
                    <div class="content-detail" v-if="review.isCamp">
                        <p><strong>营地类型：</strong> {{ getCampType(review.campType) }}</p>
                        <p><strong>是否收费：</strong> {{ review.isCharged ? "收费" : "免费" }}</p>
                        <p><strong>是否有厕所：</strong> {{ review.hasToilet ? "有" : "无" }}</p>
                        <p><strong>是否可以接水：</strong> {{ review.hasWater ? "可以" : "不可以" }}</p>
                        <p><strong>是否有充电桩：</strong> {{ review.hasElectricity ? "有" : "无" }}</p>
                        <p><strong>是否可以搭帐篷：</strong> {{ review.canPitchTent ? "可以" : "不可以" }}</p>
                        <p><strong>是否可以钓鱼：</strong> {{ review.fish ? "可以" : "不可以" }}</p>
                        <p><strong>是否可用明火：</strong> {{ review.fire ? "可以" : "不可以" }}</p>
                    </div>

                    <!-- 不是营地 -->
                    <div class="content-detail" v-if="!review.isCamp">
                        <p><strong>设施类型：</strong> {{ getFacilityType(review.convenienceFacility) }}</p>
                        <p v-if="review.convenienceFacility === 2">
                            <strong>是否可以接水：</strong> {{ review.hasWater ? "可以" : "不可以" }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="review-images">
                <h3>图片</h3>
                <div class="images-box">
                    <img v-for="(image, index) in review.images" :key="index" :src="image.previewUrl" alt="图片"></img>
                </div>
            </div>
        </el-card>

        <!-- 腾讯地图模态框 -->
        <el-dialog v-model="tencentModalVisible" :modal="false" destroy-on-close :width="dialogWidth" title="查看营地位置"
            fullscreen>
            <TencentMapViewModal :latitude="review?.latitude" :longitude="review?.longitude"
                :content="review?.address" />
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="tencentModalVisible = false">关闭</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 拒绝对话框 -->
        <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="30%">
            <el-form :model="rejectForm" ref="rejectFormRef">
                <el-form-item prop="reason" label="拒绝原因"
                    :rules="[{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]">
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
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getReviewById } from '@/api/review';
import { useReviewStore } from '@/stores/review';
import type { Review } from '@/api/review';
import type { FormInstance, imageEmits } from 'element-plus';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import TencentMapViewModal from './TencentMapViewModal.vue';

const props = defineProps<{
    reviewId: string;
}>();

// 定义关闭模态框的事件
const emit = defineEmits(['close-modal'])

const router = useRouter();

const reviewStore = useReviewStore();
const review = ref<Review | null>(null);
const approveActionLoading = ref(false);
const rejectActionLoading = ref(false);
const actionLoading = ref(false);

// 拒绝对话框相关
const rejectDialogVisible = ref(false);
const rejectForm = ref({ reason: '' });
const rejectFormRef = ref<FormInstance>();

// 腾讯地图模态框相关
const isMobile = ref(window.innerWidth <= 768);
const tencentModalVisible = ref(false)
const dialogWidth = computed(() => (isMobile.value ? "100%" : "60%"));


onMounted(async () => {
    // 监听窗口大小变化
    window.addEventListener("resize", handleResize);
    await fetchReviewDetail()
});

onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
});

// 获取审核详情
const fetchReviewDetail = async () => {
    try {
        const response = await getReviewById(props.reviewId);
        review.value = response.data;
    } catch (error) {
        console.error('获取审核详情失败', error);
        ElMessage.error('获取审核详情失败');
    }
};


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

// 营地类型
const getCampType = (type: number) => {
    const campType: Record<number, string> = {
        1: '停车场',
        2: '服务区',
        3: '露营地',
        4: '房车营地'
    }
    return campType[type] || '-'
}

// 便利设施
const getFacilityType = (type: number) => {
    const campType: Record<number, string> = {
        1: '商超',
        2: '公共厕所',
        3: '菜市场',
        4: '夜市美食'
    }
    return campType[type] || '-'
}


// 批准操作
const handleApprove = () => {
    ElMessageBox.confirm('确定要批准该审核吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        approveActionLoading.value = true;
        try {
            const updatedReview = await reviewStore.approveReviewItem(props.reviewId);
            review.value = updatedReview;
            ElMessage.success('审核已批准');
            emit('close-modal');
            router.go(0);
        } catch (error) {
            ElMessage.error('操作失败');
        } finally {
            approveActionLoading.value = false;
        }
    }).catch(() => { });
};

// 拒绝操作
const handleReject = () => {
    rejectForm.value.reason = '';
    rejectDialogVisible.value = true;
};

// 确认拒绝
const confirmReject = async () => {
    if (!rejectFormRef.value) return;

    await rejectFormRef.value.validate(async (valid) => {
        if (valid) {
            rejectActionLoading.value = true;
            try {
                const updatedReview = await reviewStore.rejectReviewItem(props.reviewId, rejectForm.value.reason);
                review.value = updatedReview;
                ElMessage.success('审核已拒绝');
                rejectDialogVisible.value = false;
                emit('close-modal');
                router.go(0);
            } catch (error) {
                ElMessage.error('操作失败');
            } finally {
                rejectActionLoading.value = false;
            }
        }
    });
};

// 地图相关
const handleOpenMap = () => {
    if (!review.value?.latitude || !review.value?.longitude) {
        ElMessage.warning('缺少位置信息，无法显示地图');
        return;
    }
    console.log("isMobile", isMobile.value)
    tencentModalVisible.value = true;
}

// 处理窗口大小变化
const handleResize = () => {
    isMobile.value = window.innerWidth <= 768;
};

// 格式化日期
const formatDate = (date: string) => {
    return dayjs(date).format("YYYY-MM-DD HH:mm:ss")
}
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.review-info {
    margin-bottom: 20px;
    line-height: 1.8;
}

.review-content h3,
.review-images h3 {
    margin-bottom: 10px;
    font-size: 18px;
}

.content-box,
.images-box {
    background-color: #f8f8f8;
    padding: 15px;
    border-radius: 4px;
    /* white-space: pre-wrap; */
    line-height: 1.6;
    margin-bottom: 20px;
}

.images-box img {
    width: 380px;
    margin-bottom: 10px;
    margin-right: 5px;
}

.content-detail {
    margin-top: 10px;
}

 :deep(.el-overlay-dialog .el-dialog .el-dialog__body) { 
   height: 100%;
}
</style>
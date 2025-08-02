<template>
    <div class="contrast-container">
        <div class="review-detail-modal">
            <div class="page-header">
                <h2>修改审批详情</h2>
                <div>
                    <el-button v-if="Number(review?.revisionDetai?.status) === 0" type="success" @click="handleApprove"
                        :loading="approveActionLoading">
                        批准
                    </el-button>
                    <el-button v-if="Number(review?.revisionDetai?.status) === 0" type="danger" @click="handleReject"
                        :loading="rejectActionLoading">
                        拒绝
                    </el-button>
                </div>
            </div>

            <el-card v-if="review">
                <template #header>
                    <div class="card-header">
                        <!-- <span>{{ review?.revisionDetai?.name }}</span> -->
                        <template v-if="differences.name && Number(review?.revisionDetai?.status) === 0">
                            <span style="color: red">{{differences.name.revised}}</span>
                            <span class="original-text">（原：{{ differences.name.original }}）</span>
                        </template>
                        <template v-else>{{ review?.revisionDetai?.name }}</template>
                        <!-- <el-tag :type="getStatusType(review?.revisionDetai?.status)"
                            :class="'status-' + review?.revisionDetai?.status">
                            {{ getStatusText(review?.revisionDetai?.status) }}
                        </el-tag> -->
                    </div>
                </template>

                <div class="review-content review-info">
                    <h3>基础信息</h3>
                    <div class="content-box">
                        <p>
                            <strong>用户：</strong> {{ revisionDetai?.submiter.nickname }}
                        </p>
                        <!-- 营地创建日期 -->
                        <p>
                            <strong>创建时间：</strong>
                            {{ formatDate(originalDetail?.createTime || '') }}
                        </p>
                        <!-- 修改提交提起 -->
                        <p>
                            <strong>提交时间：</strong>
                            {{ formatDate(revisionDetai?.submitTime) }}
                        </p>
                    </div>
                </div>

                <div class="review-content">
                    <h3>详情</h3>
                    <div class="content-box">
                        <!-- 动态渲染所有需要展示的字段 -->
                        <p v-for="field in displayFields" :key="field.key">
                            <strong>{{ field.label }}：</strong>
                            <template v-if="differences[field.key] && Number(review?.revisionDetai?.status) === 0">
                                <!-- 有差异时显示修改后（红）和修改前的值 -->
                                <span style="color: red">{{
                                    formatValue(field.key, differences[field.key].revised)
                                }}</span>
                                <span class="original-text">（原：{{
                                    formatValue(field.key, differences[field.key].original)
                                }}）</span>
                            </template>
                            <template v-else>
                                <!-- 无差异时直接显示当前值 -->
                                {{
                                    formatValue(
                                        field.key,
                                        revisionDetai?.[field.key as keyof Review]
                                    )
                                }}
                            </template>
                        </p>
                    </div>
                </div>

                <div class="review-images">
                    <h3>图片</h3>
                    <!-- <div class="images-box">
                        <img v-for="(url, index) in review?.revisionDetai?.images" :key="index" :src="url.previewUrl" alt="图片"></img>
                    </div> -->
                    <template v-if="Number(review?.revisionDetai?.status) === 0">
                        <div class="images-box">
                            <!-- 显示修改后的图片（含新增标识） -->
                            <div v-for="(img, index) in revisedImages" :key="index" class="image-wrapper"
                                :class="{ added: isImageAdded(img) }">
                                <img :src="img.previewUrl" alt="图片" class="image" />
                            </div>

                            <!-- 显示已删除的原始图片 -->
                            <div v-for="(img, index) in deletedImages" :key="index" class="image-wrapper deleted">
                                <div class="deleted-placeholder">
                                    <span>原图片：已删除</span>
                                    <img :src="img.previewUrl"></img>
                                </div>
                            </div>
                        </div>

                    </template>

                    <template v-else>
                        <div class="image-comparison">
                            <div v-for="(img, index) in revisedImages" :key="index" class="image-wrapper">
                                <img :src="img.previewUrl" alt="图片" class="image" />
                            </div>
                        </div>
                    </template>

                </div>
            </el-card>

            <!-- 拒绝对话框 -->
            <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="30%">
                <el-form :model="rejectForm" ref="rejectFormRef">
                    <el-form-item prop="reason" label="拒绝原因" :rules="[
                        { required: true, message: '请输入拒绝原因', trigger: 'blur' },
                    ]">
                        <el-input v-model="rejectForm.reason" type="textarea" :rows="4"
                            placeholder="请输入拒绝原因"></el-input>
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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getReviewById, getRevisionReviewById } from "@/api/review";
import { useReviewStore } from "@/stores/review";
import type { Review } from "@/api/review";
import type { FormInstance } from "element-plus";
import { useRouter } from "vue-router";
import dayjs from "dayjs";

const props = defineProps<{
    reviewId: string;
}>();

// 定义关闭模态框的事件
const emit = defineEmits(["close-modal"]);

const router = useRouter();

const reviewStore = useReviewStore();

const revisionDetai = ref<Review | null>();
const originalDetail = ref<Review | null>();
const review = ref({ revisionDetai, originalDetail });
const differences = ref<Record<string, { original: any; revised: any }>>({});

const approveActionLoading = ref(false);
const rejectActionLoading = ref(false);
const actionLoading = ref(false);

// 拒绝对话框相关
const rejectDialogVisible = ref(false);
const rejectForm = ref({ reason: "" });
const rejectFormRef = ref<FormInstance>();

onMounted(async () => {
    // await fetchReviewDetail();
    await fetchRevisionReviewDetail();
});

// 定义需要对比展示的字段配置
const displayFields = [
    { key: "name", label: "营地名称", type: "text" },
    { key: "description", label: "营地描述", type: "text" },
    { key: "address", label: "地址", type: "text" },
    { key: "longitude", label: "GPS经度", type: "number" },
    { key: "latitude", label: "GPS纬度", type: "number" },
    {
        key: "isCharged",
        label: "是否收费",
        type: "boolean",
        trueText: "收费",
        falseText: "免费",
    },
    {
        key: "hasToilet",
        label: "是否有厕所",
        type: "boolean",
        trueText: "有",
        falseText: "无",
    },
    {
        key: "hasWater",
        label: "是否可以接水",
        type: "boolean",
        trueText: "可以",
        falseText: "不可以",
    },
    {
        key: "hasElectricity",
        label: "是否有充电桩",
        type: "boolean",
        trueText: "有",
        falseText: "无",
    },
    {
        key: "canPitchTent",
        label: "是否可以搭帐篷",
        type: "boolean",
        trueText: "可以",
        falseText: "不可以",
    },
    // {
    //     key: "isStarCamp",
    //     label: "是否五星营地",
    //     type: "boolean",
    //     trueText: "是",
    //     falseText: "否",
    // },
];

// 格式化值（根据字段类型处理显示）
const formatValue = (key: string, value: any) => {
    const field = displayFields.find((f) => f.key === key);
    if (!value && value !== false) return "-";
    // 处理布尔值显示
    if (field?.type === "boolean") {
        return value ? field.trueText : field.falseText;
    }
    return value;
};

// 对比修改前后数据
const compareData = () => {
    const result: Record<string, { original: any; revised: any }> = {};
    if (!originalDetail.value || !revisionDetai.value) return result;

    displayFields.forEach(({ key }) => {
        const originalValue = originalDetail.value![key as keyof Review];
        const revisedValue = revisionDetai.value![key as keyof Review];
        if (originalValue !== revisedValue) {
            result[key] = { original: originalValue, revised: revisedValue };
        }
    });

    return result;
};

// 提取图片列表（默认空数组避免undefined）
const revisedImages = computed(() => revisionDetai.value?.images || []);
const originalImages = computed(() => originalDetail.value?.images || []);

// 工具函数：通过serverFilename判断图片是否存在于列表中
const imageExistsIn = (
    targetImg: { serverFilename: string },
    imageList: Array<{ serverFilename: string }>
) => {
    return imageList.some(
        (img) => img.serverFilename === targetImg.serverFilename
    );
};

// 计算属性：获取已删除的图片（原始有，修订后无）
const deletedImages = computed(() => {
    return originalImages.value.filter(
        (img) => !imageExistsIn(img, revisedImages.value)
    );
});

// 判断图片是否为新增（修订后有，原始无）
const isImageAdded = (img: { serverFilename: string }) => {
    return !imageExistsIn(img, originalImages.value);
};

// 获取修改营地的详情
const fetchRevisionReviewDetail = async () => {
    try {
        const response = await getRevisionReviewById(props.reviewId);
        review.value = response.data;
        revisionDetai.value = review.value.revisionDetai;
        originalDetail.value = review.value.originalDetail;
        differences.value = compareData();
    } catch (error) {
        console.error("获取修改详情失败", error);
        ElMessage.error("获取修改详情失败");
    }
};

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
        "unknown": "未知状态"
    };
    // return statusMap[status] || status;
    return statusMap || "未知状态"
};

// 状态类型
const getStatusType = (status: string) => {
    const typeMap: Record<string, string> = {
        "0": "warning",
        "1": "success",
        "-1": "danger",
        "unknown": "info"
    };
    return typeMap[status] || "info";
};

// 批准操作
const handleApprove = () => {
    ElMessageBox.confirm("确定要批准该审核吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            approveActionLoading.value = true;
            try {
                const updatedReview = await reviewStore.approveeRevisionReviewItem(
                    props.reviewId
                );
                revisionDetai.value = updatedReview;
                ElMessage.success("审核已批准");
                emit("close-modal");
                router.go(0);
                // await fetchReviewDetail();
            } catch (error) {
                ElMessage.error("操作失败");
            } finally {
                approveActionLoading.value = false;
            }
        })
        .catch(() => { });
};

// 拒绝操作
const handleReject = () => {
    rejectForm.value.reason = "";
    rejectDialogVisible.value = true;
};

// 确认拒绝
const confirmReject = async () => {
    if (!rejectFormRef.value) return;

    await rejectFormRef.value.validate(async (valid) => {
        if (valid) {
            rejectActionLoading.value = true;
            try {
                const updatedReview = await reviewStore.rejectReviewItem(
                    props.reviewId,
                    rejectForm.value.reason
                );
                revisionDetai.value = updatedReview;
                ElMessage.success("审核已拒绝");
                rejectDialogVisible.value = false;
                emit("close-modal");
                router.go(0);
                // await fetchReviewDetail();
            } catch (error) {
                ElMessage.error("操作失败");
            } finally {
                rejectActionLoading.value = false;
            }
        }
    });
};
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
    white-space: pre-wrap;
    line-height: 1.6;
}

.images-box img {
    width: 380px;
    margin-bottom: 10px;
    margin-right: 5px;
}

.original-text {
    color: #666;
    margin-left: 8px;
    font-size: 0.9em;
}

/* 图片样式 */
.image-comparison {
    display: flex;
    gap: 15px;
    margin-top: 12px;
    flex-wrap: wrap;
    padding: 8px;
}

/* .image-wrapper {
    position: relative;
    width: 100%;
    height: 120px;
    border: 2px solid #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.2s;
} */

.image {
    width: 380px;
    /* height: 100%; */
    object-fit: cover;
    display: block;
}

/* 新增图片样式 */
.added {
    border-color: green;
    border-width: 3px;
    /* 红色边框 */
}

/* 删除图片样式 */
.deleted {
    border-color: #ff4d4f;
    /* 灰色边框 */
    background-color: #f9fafb;
    border-width: 3px;
}

.deleted-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    font-size: 12px;
    font-weight: 800;
    text-align: center;
    padding: 4px;
}

/* 标签通用样式 */
.tag {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 2px;
    font-weight: 500;
}
</style>

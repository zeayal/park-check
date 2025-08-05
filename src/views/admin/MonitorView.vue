<template>
    <div class="monitor-container">
        <el-page-header @back="goBack" title="返回">
            <template #content>
                <span class="page-title">性能监控面板</span>
            </template>
        </el-page-header>

        <div class="stats-grid">
            <!-- 总体统计卡片 -->
            <el-card class="stats-card overview-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <el-icon><DataAnalysis /></el-icon>
                        <span>总体统计</span>
                    </div>
                </template>
                <div class="overview-stats">
                    <div class="stat-item">
                        <div class="stat-number">{{ formatNumber(performanceStats.totalRequests) }}</div>
                        <div class="stat-label">总请求数</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">{{ formatNumber(performanceStats.compressedRequests) }}</div>
                        <div class="stat-label">压缩请求数</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">{{ formatDataSize(performanceStats.totalDataProcessed) }}</div>
                        <div class="stat-label">总处理数据</div>
                    </div>
                </div>
            </el-card>

            <!-- 压缩效率卡片 -->
            <el-card class="stats-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <el-icon><TrendCharts /></el-icon>
                        <span>压缩效率</span>
                    </div>
                </template>
                <div class="compression-stats">
                    <div class="progress-section">
                        <div class="progress-item">
                            <div class="progress-label">
                                <span>压缩率</span>
                                <span class="progress-value">{{ performanceStats.compressionRate }}</span>
                            </div>
                            <el-progress 
                                :percentage="parseFloat(performanceStats.compressionRate)" 
                                :color="getProgressColor(parseFloat(performanceStats.compressionRate))"
                                :stroke-width="8"
                            />
                        </div>
                        <div class="progress-item">
                            <div class="progress-label">
                                <span>数据压缩比</span>
                                <span class="progress-value">{{ performanceStats.averageCompressionRatio }}</span>
                            </div>
                            <el-progress 
                                :percentage="parseFloat(performanceStats.averageCompressionRatio)" 
                                :color="getProgressColor(parseFloat(performanceStats.averageCompressionRatio))"
                                :stroke-width="8"
                            />
                        </div>
                        <div class="progress-item">
                            <div class="progress-label">
                                <span>数据减少</span>
                                <span class="progress-value">{{ performanceStats.dataReduction }}</span>
                            </div>
                            <el-progress 
                                :percentage="parseFloat(performanceStats.dataReduction)" 
                                :color="getProgressColor(parseFloat(performanceStats.dataReduction))"
                                :stroke-width="8"
                            />
                        </div>
                    </div>
                </div>
            </el-card>

            <!-- 性能指标卡片 -->
            <el-card class="stats-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <el-icon><Timer /></el-icon>
                        <span>性能指标</span>
                    </div>
                </template>
                <div class="performance-stats">
                    <div class="metric-item">
                        <div class="metric-icon">
                            <el-icon><Loading /></el-icon>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">{{ performanceStats.averageCompressionTime }}</div>
                            <div class="metric-label">平均压缩时间</div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-icon">
                            <el-icon><Lock /></el-icon>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">{{ performanceStats.averageEncryptionTime }}</div>
                            <div class="metric-label">平均加密时间</div>
                        </div>
                    </div>
                </div>
            </el-card>

            <!-- 数据统计卡片 -->
            <el-card class="stats-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <el-icon><Files /></el-icon>
                        <span>数据统计</span>
                    </div>
                </template>
                <div class="data-stats">
                    <div class="data-item">
                        <div class="data-label">压缩数据量</div>
                        <div class="data-value">{{ formatDataSize(performanceStats.totalDataCompressed) }}</div>
                        <div class="data-percentage">
                            占总数据量的 {{ ((performanceStats.totalDataCompressed / performanceStats.totalDataProcessed) * 100).toFixed(1) }}%
                        </div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">总处理数据量</div>
                        <div class="data-value">{{ formatDataSize(performanceStats.totalDataProcessed) }}</div>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 刷新按钮 -->
        <div class="refresh-section">
            <el-button 
                type="primary" 
                :icon="Refresh" 
                @click="refreshData"
                :loading="loading"
                size="large"
            >
                刷新数据
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { 
    DataAnalysis, 
    TrendCharts, 
    Timer, 
    Loading, 
    Lock, 
    Files, 
    Refresh 
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getPerformanceStats } from "@/api/review";

const router = useRouter();
const loading = ref(false);

const performanceStats = ref({
    averageCompressionRatio: "64.6%",
    averageCompressionTime: "0.51ms",
    averageEncryptionTime: "1.83ms",
    compressedRequests: 308,
    compressionRate: "25.6%",
    dataReduction: "30.8%",
    totalDataCompressed: 9576656,
    totalDataProcessed: 13834041,
    totalRequests: 1202,
});

// 格式化数字
const formatNumber = (num: number) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

// 格式化数据大小
const formatDataSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    } else if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    }
    return bytes + ' B';
};

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#67C23A';
    if (percentage >= 60) return '#E6A23C';
    if (percentage >= 40) return '#F56C6C';
    return '#909399';
};

// 返回上一页
const goBack = () => {
    router.back();
};

// 刷新数据
const refreshData = async () => {
    loading.value = true;
    try {
        const res = await getPerformanceStats();
        performanceStats.value = res.data;
        ElMessage.success('数据刷新成功');
    } catch (error) {
        ElMessage.error('数据刷新失败');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await refreshData();
});
</script>

<style scoped>
.monitor-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.page-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.stats-card {
    border-radius: 12px;
    transition: all 0.3s ease;
}

.stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #303133;
}

.card-header .el-icon {
    font-size: 18px;
    color: #409EFF;
}

/* 总体统计样式 */
.overview-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
}

.stat-item {
    text-align: center;
    padding: 16px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 8px;
}

.stat-number {
    font-size: 24px;
    font-weight: 700;
    color: #409EFF;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 14px;
    color: #606266;
}

/* 压缩效率样式 */
.compression-stats {
    padding: 8px 0;
}

.progress-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.progress-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.progress-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #606266;
}

.progress-value {
    font-weight: 600;
    color: #409EFF;
}

/* 性能指标样式 */
.performance-stats {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.metric-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
}

.metric-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
}

.metric-content {
    flex: 1;
}

.metric-value {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 4px;
}

.metric-label {
    font-size: 14px;
    color: #909399;
}

/* 数据统计样式 */
.data-stats {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.data-item {
    padding: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    color: white;
}

.data-label {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
}

.data-value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
}

.data-percentage {
    font-size: 12px;
    opacity: 0.8;
}

/* 刷新按钮样式 */
.refresh-section {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
    .monitor-container {
        padding: 16px;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .overview-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
    
    .stat-number {
        font-size: 20px;
    }
    
    .metric-item {
        padding: 12px;
    }
    
    .metric-icon {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }
    
    .metric-value {
        font-size: 18px;
    }
    
    .data-value {
        font-size: 20px;
    }
    
    .page-title {
        font-size: 18px;
    }
}

@media screen and (max-width: 480px) {
    .overview-stats {
        grid-template-columns: 1fr;
    }
    
    .metric-item {
        flex-direction: column;
        text-align: center;
        gap: 12px;
    }
}
</style>
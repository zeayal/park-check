<template>
    <div class="stats-grid">

        <!-- 系统资源信息卡片 -->
        <el-card class="stats-card" shadow="hover">
            <template #header>
                <div class="card-header">
                    <el-icon>
                        <Cpu />
                    </el-icon>
                    <span>系统资源信息</span>
                </div>
            </template>
            <div class="system-stats">
                <div class="system-section">
                    <div class="system-title">内存使用</div>
                    <el-progress :percentage="parseFloat(performanceStats.system.memory.percentage)"
                        :color="getProgressColor(parseFloat(performanceStats.system.memory.percentage))"
                        :stroke-width="10" />
                    <div class="system-desc">
                        <span>总内存: {{ performanceStats.system.memory.total }}</span>
                        <span>已用: {{ performanceStats.system.memory.used }}</span>
                        <span>空闲: {{ performanceStats.system.memory.free }}</span>
                    </div>
                </div>
                <div class="system-section">
                    <div class="system-title">CPU使用</div>
                    <el-tag type="success">{{ performanceStats.system.cpu.usage }}</el-tag>
                    <div class="system-desc">负载均值: {{ performanceStats.system.cpu.loadAverage.join(' / ') }}</div>
                </div>
                <div class="system-section">
                    <div class="system-title">运行时间</div>
                    <el-tag>{{ performanceStats.system.uptime }}</el-tag>
                </div>
                <div class="system-section">
                    <div class="system-title">进程内存</div>
                    <el-descriptions :column="2" border size="small">
                        <el-descriptions-item label="RSS">{{ performanceStats.system.process.rss
                            }}</el-descriptions-item>
                        <el-descriptions-item label="Heap Used">{{ performanceStats.system.process.heapUsed
                            }}</el-descriptions-item>
                        <el-descriptions-item label="Heap Total">{{ performanceStats.system.process.heapTotal
                            }}</el-descriptions-item>
                        <el-descriptions-item label="External">{{ performanceStats.system.process.external
                            }}</el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>
        </el-card>
        <!-- 请求统计卡片 -->
        <el-card class="stats-card" shadow="hover">
            <template #header>
                <div class="card-header">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <span>请求统计</span>
                </div>
            </template>
            <div class="overview-stats">
                <div class="stat-item">
                    <div class="stat-number">{{ formatNumber(performanceStats.requests.total) }}</div>
                    <div class="stat-label">总请求数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ formatNumber(performanceStats.requests.compressed) }}</div>
                    <div class="stat-label">压缩请求数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ performanceStats.requests.compressionRate }}</div>
                    <div class="stat-label">压缩率</div>
                </div>
            </div>
        </el-card>

        <!-- 数据处理统计卡片 -->
        <el-card class="stats-card" shadow="hover">
            <template #header>
                <div class="card-header">
                    <el-icon>
                        <Files />
                    </el-icon>
                    <span>数据处理统计</span>
                </div>
            </template>
            <div class="overview-stats">
                <div class="stat-item">
                    <div class="stat-number">{{ formatDataSize(performanceStats.data.totalProcessed) }}</div>
                    <div class="stat-label">总处理数据量</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ formatDataSize(performanceStats.data.totalCompressed) }}</div>
                    <div class="stat-label">总压缩数据量</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ performanceStats.data.dataReduction }}</div>
                    <div class="stat-label">数据减少率</div>
                </div>
            </div>
        </el-card>

        <!-- 性能指标卡片 -->
        <el-card class="stats-card" shadow="hover">
            <template #header>
                <div class="card-header">
                    <el-icon>
                        <TrendCharts />
                    </el-icon>
                    <span>性能指标</span>
                </div>
            </template>
            <div class="performance-stats">
                <div class="metric-item">
                    <div class="metric-icon">
                        <el-icon>
                            <Loading />
                        </el-icon>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value">{{ performanceStats.performance.averageCompressionTime }}</div>
                        <div class="metric-label">平均压缩时间</div>
                    </div>
                </div>
                <div class="metric-item">
                    <div class="metric-icon">
                        <el-icon>
                            <Lock />
                        </el-icon>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value">{{ performanceStats.performance.averageEncryptionTime }}</div>
                        <div class="metric-label">平均加密时间</div>
                    </div>
                </div>
                <div class="metric-item">
                    <div class="metric-icon">
                        <el-icon>
                            <Timer />
                        </el-icon>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value">{{ performanceStats.performance.averageCompressionRatio }}</div>
                        <div class="metric-label">平均压缩比</div>
                    </div>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
    DataAnalysis,
    TrendCharts,
    Timer,
    Loading,
    Lock,
    Files,
    Cpu,
    Refresh
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getPerformanceStats } from "@/api/review";

const loading = ref(false);

const performanceStats = ref({
    requests: {
        total: 0,
        compressed: 0,
        compressionRate: "0%"
    },
    data: {
        totalProcessed: 0,
        totalCompressed: 0,
        dataReduction: "0%"
    },
    performance: {
        averageCompressionTime: "0.00ms",
        averageEncryptionTime: "0.00ms",
        averageCompressionRatio: "0.0%"
    },
    system: {
        memory: {
            total: "0 MB",
            used: "0 MB",
            free: "0 MB",
            percentage: "0%"
        },
        cpu: {
            usage: "0%",
            loadAverage: ["0.00", "0.00", "0.00"]
        },
        uptime: "0分钟",
        process: {
            rss: "0 MB",
            heapUsed: "0 MB",
            heapTotal: "0 MB",
            external: "0 MB"
        }
    }
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
    if (typeof bytes === 'string') return bytes;
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

// 刷新数据
const refreshData = async () => {
    loading.value = true;
    try {
        const res = await getPerformanceStats();
        performanceStats.value = res.data;
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

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
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

.system-stats {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.system-section {
    margin-bottom: 8px;
}

.system-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #409EFF;
}

.system-desc {
    font-size: 13px;
    color: #606266;
    margin-top: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.refresh-section {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

@media screen and (max-width: 768px) {
    .monitor-container {
        padding: 12px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
        gap: 14px;
    }

    .overview-stats {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    .stat-number {
        font-size: 18px;
    }

    .metric-item {
        padding: 10px;
    }

    .metric-icon {
        width: 36px;
        height: 36px;
        font-size: 14px;
    }

    .metric-value {
        font-size: 16px;
    }

    .system-title {
        font-size: 14px;
    }
}

@media screen and (max-width: 480px) {
    .overview-stats {
        grid-template-columns: 1fr;
    }

    .metric-item {
        flex-direction: column;
        text-align: center;
        gap: 8px;
    }
}
</style>
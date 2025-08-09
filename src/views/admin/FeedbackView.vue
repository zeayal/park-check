<template>
  <div class="container">
    <div class="title">
      <h2>用户反馈列表</h2>
    </div>

    <el-table
      :data="tableData"
      stripe
      height="75vh"
      style="width: 100%"
      border
      show-overflow-tooltip
    >
      <el-table-column prop="id" label="Id" width="120" />
      <el-table-column prop="user_id" label="用户ID" width="120" />
      <el-table-column prop="type" label="反馈类型" width="130" />
      <el-table-column prop="content" label="反馈内容" />
      <el-table-column prop="mobile" label="手机号" width="150" />
      <!-- <el-table-column prop="pics" label="图片" width="100" /> -->
      <el-table-column prop="createdAt" label="创建日期" width="180" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { getUserFeedback } from "@/api/review";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

const tableData = ref([]);

onMounted(() => {
  getFeedbackData();
});

// 获取用户反馈
const getFeedbackData = async () => {
  try {
    const res = await getUserFeedback();
    if (res.code === 0) {
      tableData.value = res.data.map((item: any) => ({
        ...item,
        createdAt: formatDate(item.createdAt),
      }));
      console.log(tableData.value);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error("接口获取失败");
    console.log(error);
  }
};

//

// 处理日期格式
const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};
</script>

<style scoped>
.title {
  margin-bottom: 10px;
}
</style>

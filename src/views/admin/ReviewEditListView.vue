<template>
  <div class="container">
    <ReviewRevisionListView
      mode="edit"
      title="修改营地管理"
      v-model:loading="loading"
      class="custom-modal"
    />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import ReviewRevisionListView from "@/components/review/ReviewRevisionListView.vue";

const loading = ref(false);
</script>

<style scoped>
::v-deep.custom-modal .el-dialog {
  width: 50% !important;
}

@media screen and (max-width: 768px) {
  /* 若组件是基于 el-dialog 封装，直接修改 el-dialog 样式 */
  ::v-deep.custom-modal .el-dialog {
    width: 90% !important; /* 手机端占比更大，如 90% */
  }
}
</style>

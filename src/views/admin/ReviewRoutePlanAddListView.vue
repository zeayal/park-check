<template>
  <div class="container">
    <ReviewRoutePlanListViewComponent mode="add" title="新增旅游线路管理" v-model:loading="loading" class="custom-modal" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import ReviewRoutePlanListViewComponent from "@/components/review/ReviewRoutePlanListViewComponent.vue";

const loading = ref(false);
</script>

<style scoped>
::v-deep.custom-modal .el-dialog {
  width: 50% !important;
}

@media screen and (max-width: 768px) {
  ::v-deep.custom-modal .el-dialog {
    width: 90% !important;
  }
}
</style>

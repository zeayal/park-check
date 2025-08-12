<template>
  <div class="container">
    <ReviewRevisionRoutePlanListViewComponent mode="edit" title="修改旅游线路" v-model:loading="loading" class="custom-modal" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import ReviewRevisionRoutePlanListViewComponent from "@/components/review/ReviewRevisionRoutePlanListViewComponent.vue";

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

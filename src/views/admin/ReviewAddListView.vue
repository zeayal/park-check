<template>
  <div class="container">
    <ReviewListView
      mode="add"
      title="新增营地管理"
      v-model:loading="loading"
      class="custom-modal"
    />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import ReviewListView from "@/components/review/ReviewListView.vue";

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

<template>
  <div class="container">
    <ReviewCommentListComp
      mode="edit"
      title="打卡审核管理"
      v-model:loading="loading"
    />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import ReviewCommentListComp from "@/components/review/ReviewCommentListComp.vue";

const loading = ref(false);
</script>

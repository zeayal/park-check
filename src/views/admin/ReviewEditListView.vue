<template>
  <div class="container">
    <ReviewRevisionListView mode="edit" title="修改营地管理" v-model:loading="loading" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import ReviewRevisionListView from '@/components/review/ReviewRevisionListView.vue';

const loading = ref(false);

</script>
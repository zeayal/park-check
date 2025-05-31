<template>
  <div class="container">
    <ReviewListView mode="add" title="新增营地管理" v-model:loading="loading" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import ReviewListView from '@/components/review/ReviewListView.vue';

const loading = ref(false);

</script>
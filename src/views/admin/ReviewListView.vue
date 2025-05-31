<template>
  <div class="container">
    <ReviewListView :mode="mode" :title="pageTitle" v-model:loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ReviewListView from '@/components/review/ReviewListView.vue';

const loading = ref(false);

const props = defineProps<{
  mode?: 'add' | 'edit'
}>();

// const mode = props.mode;

// 根据 mode 显示不同的标题
const pageTitle = computed(() => {
  switch (props.mode) {
    case 'add':
      return '新增营地管理';
    case 'edit':
      return '修改营地管理';
    default:
      return '审核管理';
  }
});

</script>
<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <el-button type="primary" @click="goHome">返回首页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 1rem;
  background-color: #f5f7fa;
}

h1 {
  font-size: clamp(4rem, 15vw, 8rem);
  color: #409EFF;
  margin-bottom: 1rem;
  line-height: 1;
}

p {
  font-size: clamp(1rem, 4vw, 1.5rem);
  color: #666;
  margin-bottom: 2rem;
}

.el-button {
  padding: 12px 24px;
  font-size: 1rem;
}

/* 响应式样式 */
@media screen and (max-width: 480px) {
  .not-found {
    padding: 0.5rem;
  }

  .el-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}
</style> 
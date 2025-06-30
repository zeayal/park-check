<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// App根组件
</script>

<style>
/* 全局样式 */
:root {
  --max-width: 1200px;
  --min-width: 320px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
}

/* 响应式断点 */
@media screen and (max-width: 768px) {
  .app-container {}
}

@media screen and (max-width: 480px) {
  .app-container {}
}
</style>

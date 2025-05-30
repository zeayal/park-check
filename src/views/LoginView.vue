<template>
  <div class="auth-container">
    <div class="auth-form">
      <div class="auth-header">
        <h2>管理员登录</h2>
      </div>
      
      <el-form :model="form" :rules="rules" ref="loginForm" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input v-model="form.password" placeholder="密码" type="password" prefix-icon="Lock" show-password />
        </el-form-item>
        
        <div class="form-footer">
          <el-button type="primary" native-type="submit" :loading="loading">登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import type { FormInstance, FormRules } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();
const loginForm = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' },
  ],
};

const handleLogin = async () => {
  if (!loginForm.value) return;

  await loginForm.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const username = form.username;
        const password = form.password;
        const res = await authStore.login({
          username,
          password
        });
        if(res.code === 0) {
          router.push('/admin/dashboard');
        }
      } finally {
        loading.value = false;
      }
    }
  });
}

// const handleLogin = async () => {
//   if (!loginForm.value) return;
  
//   await loginForm.value.validate(async (valid) => {
//     if (valid) {
//       loading.value = true;
      
//       try {
//         // 模拟登录成功
//         localStorage.setItem('token', 'mock-token');
//         authStore.setUser({
//           id: 1,
//           username: form.username,
//           role: 'admin'
//         });
//         authStore.isAuthenticated = true;
        
//         ElMessage.success('登录成功');
//         router.push('/admin/dashboard');
//       } catch (error: any) {
//         ElMessage.error(error.message || '登录失败，请检查用户名和密码');
//       } finally {
//         loading.value = false;
//       }
//     }
//   });
// };
</script>

<style scoped>
/* 样式已在全局CSS中定义 */
</style> 
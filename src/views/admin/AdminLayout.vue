<template>
  <div class="admin-layout">
    <el-container>
      <el-aside :width="sidebarCollapsed ? '64px' : '200px'">
        <div class="sidebar-header" @click="toggleSidebar">
          <h2 v-if="!sidebarCollapsed">后台管理系统</h2>
          <el-icon v-else>
            <Menu />
          </el-icon>
        </div>
        <el-menu router :default-active="$route.path" class="el-menu-vertical" background-color="#304156"
          text-color="#fff" active-text-color="#409EFF" :collapse="sidebarCollapsed">
          <el-menu-item index="/admin/dashboard">
            <el-icon>
              <Menu />
            </el-icon>
            <span slot="title">控制面板</span>
          </el-menu-item>
          <el-menu-item index="/admin/reviews">
            <el-icon>
              <Document />
            </el-icon>
            <span slot="title">审核管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                {{ username }}
                <el-icon class="el-icon--right">
                  <ArrowDown />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Menu, Document, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const authStore = useAuthStore();
const sidebarCollapsed = ref(false);

const username = computed(() => authStore.user?.username || '管理员');

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const handleCommand = (command: string) => {
  if (command === 'logout') {
    authStore.logout();
    router.push('/login');
  }
};
</script>

<style scoped>
.admin-layout {
  height: 100%;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
  color: #fff;
  height: 100%;
  transition: width 0.3s;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}

.sidebar-header {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-header h2 {
  margin: 0;
}

.sidebar-header .el-icon {
  font-size: 20px;
}

.header-right {
  padding-right: 20px;
  align-items: center;
  justify-content: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
  display: flex;
  align-items: center;
  margin-top: 35%;
}
</style>
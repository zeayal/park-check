<template>
  <div class="admin-layout">

    <el-aside :class="{ 'is-collapsed': isMobileMenuOpen }" :width="sidebarCollapsed ? '64px' : '200px'">
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
        <el-menu-item index="/admin/reviews/add">
          <el-icon>
            <Document />
          </el-icon>
          <span slot="title">新增营地管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/reviews/edit">
          <el-icon>
            <Document />
          </el-icon>
          <span slot="title">修改营地管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="mobile-menu-btn" @click="toggleMobileMenu">
          <el-icon>
            <Menu />
          </el-icon>
        </div>
      </el-header>
      <el-main :class="sidebarCollapsed ? 'el-main-custom-collapsed-container' : 'el-main-custom-container'">
        <router-view />
      </el-main>
    </el-container>

    <!-- 移动端侧边栏的覆盖层 -->
    <div v-if="isMobile && isMobileMenuOpen" class="mobile-menu-backdrop" @click="toggleMobileMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Menu, Document, ArrowDown } from '@element-plus/icons-vue';
import { storage } from '@/utils/storage';

const router = useRouter();
const authStore = useAuthStore();
const sidebarCollapsed = ref(storage.get('sidebarCollapsed'));
const isMobileMenuOpen = ref(false);
const isMobile = ref(window.innerWidth <= 768);

// const username = computed(() => authStore.user?.username || '管理员');

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  storage.set('sidebarCollapsed',sidebarCollapsed.value)
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const handleCommand = (command: string) => {
  if (command === 'logout') {
    authStore.logout();
    router.push('/login');
  }
};

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768; // 更新isMobile状态
  if (window.innerWidth > 768) {
    isMobileMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
  color: #fff;
  height: 100%;
  transition: all 0.3s;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 999;
  /* 新增头部左侧边距的过渡效果 */
  transition: left 0.3s;
}

.el-main {
  background-color: #f5f7fa;
  padding: 0;
  padding-bottom: 80px;
  margin-top: 60px;
  transition: margin-left 0.3s;
}

.el-main-custom-collapsed-container {
  margin-left: 64px;
}

.el-main-custom-container {
  margin-left: 200px;
}

.el-menu {
  border: none;
}


/* 新增桌面端主内容区域边距调整 */
@media screen and (min-width: 769px) {

  .el-header {
    /* 头部左侧边距 */
  }
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-header .el-icon {
  font-size: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
  display: flex;
  align-items: center;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  font-size: 20px;
  cursor: pointer;
  color: #409EFF;
}

/* 重构移动端样式 */
@media screen and (max-width: 768px) {

  .mobile-menu-btn {
    display: block;
  }

  .mobile-menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 995;
  }

  .el-header {
    left: 0;
    padding: 0 10px;
  }

  .sidebar-header h2 {
    font-size: 16px;
  }
}
</style>
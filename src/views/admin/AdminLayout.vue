<template>
  <div class="admin-layout">
    <el-container>
      <el-header style="padding: 0!important;">
        <el-menu router :default-active="$route.path" class="el-menu-vertical" background-color="#304156"
          text-color="#fff" active-text-color="#409EFF" :collapse="sidebarCollapsed" mode="horizontal">
          <el-menu-item index="/admin/dashboard">
            <el-icon>
              <Menu />
            </el-icon>
            <span slot="title">控制面板</span>
          </el-menu-item>
          <el-menu-item index="/admin/reviews/add">
            <el-badge v-if="reviewStore.pendingCounts['/admin/reviews/add'] !== 0"
              :value="reviewStore.pendingCounts['/admin/reviews/add']" :max="99" class="badge-item">
              <el-icon>
                <CirclePlus />
              </el-icon>
            </el-badge>

            <el-icon v-else>
              <CirclePlus />
            </el-icon>
            <span slot="title">新增营地管理</span>
          </el-menu-item>

          <!-- v-if="pendingCounts['/admin/reviews/edit'] !== 0"
            :value="pendingCounts['/admin/reviews/edit']" -->
          <el-menu-item index="/admin/reviews/edit">
            <el-badge v-if="reviewStore.pendingCounts['/admin/reviews/edit'] !== 0"
              :value="reviewStore.pendingCounts['/admin/reviews/edit']" :max="99" class="badge-item">
              <el-icon>
                <Edit />
              </el-icon>
            </el-badge>

            <el-icon v-else>
              <Edit />
            </el-icon>
            <span slot="title">修改营地管理</span>
          </el-menu-item>

          <!--  v-if="pendingCounts['/admin/reviews/comment'] !== 0"
            :value="pendingCounts['/admin/reviews/comment']" -->
          <el-menu-item index="/admin/reviews/comment">
            <el-badge v-if="reviewStore.pendingCounts['/admin/reviews/comment'] !== 0"
              :value="reviewStore.pendingCounts['/admin/reviews/comment']" :max="99" class="badge-item">
              <el-icon>
                <ChatLineRound />
              </el-icon>
            </el-badge>

            <el-icon v-else>
              <ChatLineRound />
            </el-icon>
            <span slot="title">打卡审核管理</span>
          </el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>

    <!-- 移动端侧边栏的覆盖层 -->
    <div v-if="isMobile && isMobileMenuOpen" class="mobile-menu-backdrop" @click="toggleMobileMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useReviewStore } from "@/stores/review";
import { storage } from "@/utils/storage";
import {
  Edit,
  CirclePlus,
  ChatLineRound,
  Menu,
  Expand,
  Fold,
} from "@element-plus/icons-vue";
import { getReviews, getEditReviews, getCommentList } from "@/api/review";

const router = useRouter();
const authStore = useAuthStore();
const sidebarCollapsed = ref(storage.get("sidebarCollapsed"));
const isMobileMenuOpen = ref(false);
const isMobile = ref(window.innerWidth <= 768);

const reviewStore = useReviewStore();

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  storage.set("sidebarCollapsed", sidebarCollapsed.value);
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768; // 更新isMobile状态
  if (window.innerWidth > 768) {
    isMobileMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);

  // 初始化徽章数量
  reviewStore.refreshPendingCounts();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.el-container {
  height: 100%;
}


.el-main {
  background-color: #f5f7fa;
  padding: 0;
  padding-bottom: 80px;
  transition: margin-left 0.3s;
}

.el-main-custom-collapsed-container {
  margin-left: 44px;
}

.el-main-custom-container {
  margin-left: 200px;
}

.el-menu {
  border: none;
}


.sidebar-header {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 16px;
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
  color: #409eff;
  display: flex;
  align-items: center;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  font-size: 20px;
  cursor: pointer;
  color: #409eff;
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

  .sidebar-header .el-icon {
    font-size: 16px;
  }

  .sidebar-header h2 {
    font-size: 20px;
  }
}

:deep(.badge-item) {
  margin-top: 10px;
}

:deep(.el-badge__content) {
  border: none;
}

:deep(.el-badge__content.is-fixed) {
  font-size: 10px;
}

:deep(.el-menu-item) {
  display: inline-block;
}

.el-menu-item {
  display: inline-flex;
}
</style>

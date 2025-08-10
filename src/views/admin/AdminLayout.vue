<template>
  <div class="admin-layout">
    <el-container>
      <el-header class="menu-header">
        <el-menu router :default-active="$route.path" class="el-menu-vertical" background-color="#304156"
          text-color="#fff" active-text-color="#409EFF" mode="horizontal">
          <el-menu-item index="/admin/dashboard">
            <el-icon>
              <House />
            </el-icon>
            <span slot="title" class="hidden-md-and-down">控制面板</span>
          </el-menu-item>
          <el-menu-item index="/admin/reviews/add">
            <el-badge v-if="reviewStore.dashboardData.totalAddPendingReview !== 0"
              :value="reviewStore.dashboardData.totalAddPendingReview || 0" :max="99">
              <el-icon>
                <CirclePlus />
              </el-icon>
            </el-badge>

            <el-icon v-else>
              <CirclePlus />
            </el-icon>
            <span slot="title" class="hidden-md-and-down">新增营地</span>
          </el-menu-item>

          <el-menu-item index="/admin/reviews/edit">
            <el-badge v-if="reviewStore.dashboardData.totalEditPendingReview !== 0"
              :value="reviewStore.dashboardData.totalEditPendingReview || 0" :max="99">
              <el-icon>
                <Edit />
              </el-icon>
            </el-badge>

            <el-icon v-else>
              <Edit />
            </el-icon>
            <span slot="title" class="hidden-md-and-down">修改营地</span>
          </el-menu-item>
          <el-menu-item index="/admin/reviews/comment">
            <el-badge v-if="reviewStore.dashboardData.totalCommentPendingReview !== 0"
              :value="reviewStore.dashboardData.totalCommentPendingReview || 0" :max="99">
              <el-icon>
                <ChatLineRound />
              </el-icon>
            </el-badge>

            <el-icon v-else>
              <ChatLineRound />
            </el-icon>
            <span slot="title" class="hidden-md-and-down">打卡审核</span>
          </el-menu-item>

          <el-menu-item index="/admin/router-plans/addList">
            <el-icon>
              <Odometer />
            </el-icon>
            <span slot="title" class="hidden-md-and-down">新增线路</span>
          </el-menu-item>

          <el-menu-item index="/admin/feedback">
            <el-icon>
              <Service />
            </el-icon>
            <span slot="title" class="hidden-md-and-down">用户反馈</span>
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
import { useReviewStore } from "@/stores/review";
import {
  Edit,
  CirclePlus,
  ChatLineRound,
  House,
  Odometer,
  Service,
} from "@element-plus/icons-vue";

const isMobileMenuOpen = ref(false);
const isMobile = ref(window.innerWidth <= 768);

const reviewStore = useReviewStore();

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
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.menu-header {
  padding: 0 !important;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}

:deep(.el-menu--horizontal) {
  height: 50px;
}

:deep(.el-icon) {
  display: block;
}

.admin-layout {
  min-height: 100vh;
}

.el-container {
  height: 100%;
}

.el-main {
  margin-top: 50px;
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

:deep(.el-badge__content) {
  border: none;
}

:deep(.el-badge__content.is-fixed) {
  font-size: 10px;
}

/* :deep(.el-menu-item) {
  display: inline-block;
} */

.el-menu-item {
  display: inline-flex;
}
</style>

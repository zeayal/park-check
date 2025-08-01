<template>
  <div class="admin-layout">
    <el-aside
      :class="{ 'is-collapsed': isMobileMenuOpen }"
      :width="sidebarCollapsed ? '64px' : '200px'"
    >
      <div class="sidebar-header" @click="toggleSidebar">
        <h2 v-if="!sidebarCollapsed">
          <el-icon>
            <Fold />
          </el-icon>
          后台管理系统
        </h2>
        <el-icon v-else>
          <Expand />
        </el-icon>
      </div>
      <el-menu
        router
        :default-active="$route.path"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
        :collapse="sidebarCollapsed"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon>
            <Menu />
          </el-icon>
          <span slot="title">控制面板</span>
        </el-menu-item>
        <el-menu-item index="/admin/reviews/add">
          <el-badge
            v-if="reviewStore.pendingCounts['/admin/reviews/add'] !== 0"
            :value="reviewStore.pendingCounts['/admin/reviews/add']"
            :max="99"
            class="badge-item"
          >
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
          <el-badge
            v-if="reviewStore.pendingCounts['/admin/reviews/edit'] !== 0"
            :value="reviewStore.pendingCounts['/admin/reviews/edit']"
            :max="99"
            class="badge-item"
          >
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
          <el-badge
            v-if="reviewStore.pendingCounts['/admin/reviews/comment'] !== 0"
            :value="reviewStore.pendingCounts['/admin/reviews/comment']"
            :max="99"
            class="badge-item"
          >
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
    </el-aside>
    <el-container>
      <el-header>
        <div class="mobile-menu-btn" @click="toggleMobileMenu">
          <el-icon>
            <Menu />
          </el-icon>
        </div>
      </el-header>
      <el-main
        :class="
          sidebarCollapsed
            ? 'el-main-custom-collapsed-container'
            : 'el-main-custom-container'
        "
      >
        <router-view />
      </el-main>
    </el-container>

    <!-- 移动端侧边栏的覆盖层 -->
    <div
      v-if="isMobile && isMobileMenuOpen"
      class="mobile-menu-backdrop"
      @click="toggleMobileMenu"
    ></div>
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

// const username = computed(() => authStore.user?.username || '管理员');

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  storage.set("sidebarCollapsed", sidebarCollapsed.value);
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// 初始化待审核状态数据
// const pendingCounts = ref({
//   "/admin/reviews/add": 0,
//   "/admin/reviews/edit": 0,
//   "/admin/reviews/comment": 0,
// });

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768; // 更新isMobile状态
  if (window.innerWidth > 768) {
    isMobileMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  // initPendingCount();
  // 初始化徽章数量
  reviewStore.refreshPendingCounts();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

// 初始化所有徽章数量的函数
// const initPendingCount = async () => {
//   const addRes = await getReviews({ statusList: "0" });
//   pendingCounts.value["/admin/reviews/add"] = addRes.total;

//   const editRes = await getEditReviews({ statusList: "0" });
//   pendingCounts.value["/admin/reviews/edit"] = editRes.total;

//   const commentRes = await getCommentList({ statusList: "0" });
//   pendingCounts.value["/admin/reviews/comment"] = commentRes.total;
// };
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

  .el-header {
    left: 0;
    padding: 0 10px;
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
</style>

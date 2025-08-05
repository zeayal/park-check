import { defineStore } from "pinia";
import {
  getReviews,
  approveReview,
  rejectReview,
  approveRevisionReview,
  getDashbordStatistics,
  rejectEditCamp,
} from "@/api/review";
import type { Review, ReviewParams, DashboardData } from "@/api/review";

interface ReviewState {
  reviews: Review[];
  total: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  currentStatus: string | null;
  // 新增大屏数据
  dashboardData: DashboardData;
}

export const useReviewStore = defineStore("review", {
  state: (): ReviewState => ({
    reviews: [],
    total: 0,
    loading: false,
    currentPage: 1,
    pageSize: 100,
    currentStatus: null,
    // 初始化大屏状态
    dashboardData: {
      total: 0,
      totalAddApproved: 0,
      totalAddPendingReview: 0,
      totalEditPendingReview: 0,
      totalCommentPendingReview: 0,
      recentList: [],
      dailyNewUsersInLastSevenDays: [],
      totalUsers: 0,
    },
  }),

  actions: {
    // 初始路由监听
    initRouteListener(router: any) {
      router.afterEach(async () => {
        // 每次路由跳转后刷新大屏数据
        console.log("每次路由跳转后刷新大屏数据");
        await this.refreshDashboard();
      });
    },

    // 刷新大屏
    async refreshDashboard() {
      try {
        this.loading = true;
        const response = await getDashbordStatistics();
        const dailyNewUsersInLastSevenDays =
          response.dailyNewUsersInLastSevenDays.reverse().slice(0, 7);
        this.dashboardData = {
          ...response,
          dailyNewUsersInLastSevenDays,
        };
      } catch (error) {
        console.error("刷新大屏refreshDashboard error", error);
      } finally {
        this.loading = false;
      }
      console.log("刷新大屏ending", this.loading);
    },

    // 初始化时请求一次

    async fetchReviews(params?: ReviewParams) {
      this.loading = true;

      try {
        const { statusList, page = 1, pageSize = 100 } = params || {};
        const response = await getReviews({ statusList, page, pageSize });

        this.reviews = response.items;
        this.total = response.total;
        this.currentPage = page;
        this.pageSize = pageSize;
        this.currentStatus = statusList || null;
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },

    async approveReviewItem(id: string) {
      try {
        const updatedReview = await approveReview(id);
        const index = this.reviews.findIndex((review) => review.id === id);

        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }

        // 批准后刷新大屏
        await this.refreshDashboard();

        return updatedReview;
      } catch (error) {
        throw error;
      }
    },

    async approveeRevisionReviewItem(id: string) {
      try {
        const updatedReview = await approveRevisionReview(id);
        const index = this.reviews.findIndex((review) => review.id === id);

        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }

        // 批准后刷新大屏
        await this.refreshDashboard();

        return updatedReview;
      } catch (error) {
        throw error;
      }
    },

    // 拒绝新增
    async rejectReviewItem(id: string, reason: string) {
      try {
        const updatedReview = await rejectReview(id, reason);
        const index = this.reviews.findIndex((review) => review.id === id);

        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }

        // 拒绝后刷新大屏
        await this.refreshDashboard();

        return updatedReview;
      } catch (error) {
        throw error;
      }
    },

    // 修改审核拒绝
    async rejectEditItem(id: string, reason: string) {
      try {
        const updatedReview = await rejectEditCamp(id, reason);
        const index = this.reviews.findIndex((review) => review.id === id);

        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }

        // 拒绝后刷新大屏
        await this.refreshDashboard();

        return updatedReview;
      } catch (error) {
        throw error;
      }
    },
  },
});

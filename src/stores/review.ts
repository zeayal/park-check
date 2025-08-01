import { defineStore } from "pinia";
import {
  getReviews,
  approveReview,
  rejectReview,
  approveRevisionReview,
  getEditReviews,
  getCommentList,
} from "@/api/review";
import type { Review, ReviewParams, ReviewResponse } from "@/api/review";

interface ReviewState {
  reviews: Review[];
  total: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  currentStatus: string | null;
  // 新增徽章状态
  pendingCounts: {
    "/admin/reviews/add": number;
    "/admin/reviews/edit": number;
    "/admin/reviews/comment": number;
  };
}

export const useReviewStore = defineStore("review", {
  state: (): ReviewState => ({
    reviews: [],
    total: 0,
    loading: false,
    currentPage: 1,
    pageSize: 100,
    currentStatus: null,
    // 初始化徽章状态
    pendingCounts: {
      "/admin/reviews/add": 0,
      "/admin/reviews/edit": 0,
      "/admin/reviews/comment": 0,
    },
  }),

  actions: {
    // 新增：刷新所有徽章数量
    async refreshPendingCounts() {
      try {
        const [addRes, editRes, commentRes] = await Promise.all([
          getReviews({ statusList: "0" }),
          getEditReviews({ statusList: "0" }),
          getCommentList({ statusList: "0" }),
        ]);

        this.pendingCounts["/admin/reviews/add"] = addRes.total;
        this.pendingCounts["/admin/reviews/edit"] = editRes.total;
        this.pendingCounts["/admin/reviews/comment"] = commentRes.total;
      } catch (error) {
        console.error("刷新徽章失败:", error);
      }
    },

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

        // 批准后刷新徽章
        await this.refreshPendingCounts();

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

        // 批准后刷新徽章
        await this.refreshPendingCounts();

        return updatedReview;
      } catch (error) {
        throw error;
      }
    },

    async rejectReviewItem(id: string, reason: string) {
      try {
        const updatedReview = await rejectReview(id, reason);
        const index = this.reviews.findIndex((review) => review.id === id);

        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }

        // 拒绝后刷新徽章
        await this.refreshPendingCounts();

        return updatedReview;
      } catch (error) {
        throw error;
      }
    },
  },
});

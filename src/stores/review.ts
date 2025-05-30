import { defineStore } from "pinia";
import { getReviews, approveReview, rejectReview } from "@/api/review";
import type { Review, ReviewParams, ReviewResponse } from "@/api/review";

interface ReviewState {
  reviews: Review[];
  total: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  currentStatus: string | null;
}

export const useReviewStore = defineStore("review", {
  state: (): ReviewState => ({
    reviews: [],
    total: 0,
    loading: false,
    currentPage: 1,
    pageSize: 100,
    currentStatus: null,
  }),

  actions: {
    async fetchReviews(params?: ReviewParams) {
      this.loading = true;

      try {
        const { statusList, page = 1, pageSize = 100 } = params || {};
        const response = await getReviews({ statusList, page, pageSize });

        this.reviews = response.items;
        this.total = response.total;
        this.currentPage = page;
        this.pageSize = pageSize;
        this.currentStatus = status || null;
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

        return updatedReview;
      } catch (error) {
        throw error;
      }
    },
  },
});

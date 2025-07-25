import component from "element-plus/es/components/tree-select/src/tree-select-option.mjs";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/admin/dashboard",
  },
  {
    path: "/admin/login",
    name: "Login",
    component: () => import("@/views/LoginView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/admin",
    component: () => import("@/views/admin/AdminLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/admin/DashboardView.vue"),
      },
      {
        path: "reviews/add",
        name: "AddReview",
        component: () => import("@/views/admin/ReviewAddListView.vue"),
      },
      {
        path: "reviews/edit",
        name: "EditReview",
        component: () => import("@/views/admin/ReviewEditListView.vue"),
      },
      {
        path: "reviews/comment",
        name: "CommentReview",
        component: () => import("@/views/admin/ReviewCommentListView.vue"),
      },
      {
        path: "reviews",
        name: "Reviews",
        component: () => import("@/views/admin/ReviewAddListView.vue"),
      },
      // {
      //   path: "reviews/:id",
      //   name: "ReviewDetail",
      //   component: () => import("@/views/admin/ReviewDetailView.vue"),
      //   props: true,
      // },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

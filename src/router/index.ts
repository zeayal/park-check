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
        path: "reviews",
        name: "Reviews",
        component: () => import("@/views/admin/ReviewListView.vue"),
      },
      {
        path: "reviews/:id",
        name: "ReviewDetail",
        component: () => import("@/views/admin/ReviewDetailView.vue"),
        props: true,
      },
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

// 路由守卫
// router.beforeEach((to, from, next) => {
//   const isAuthenticated = !!localStorage.getItem("token");
//   const requiresAuth = to.matched.some(
//     (record) => record.meta.requiresAuth !== false
//   );

//   if (requiresAuth && !isAuthenticated) {
//     next("/login");
//   } else if (to.path === "/login" && isAuthenticated) {
//     // 避免已认证用户访问登录页面。
//     next("/admin/dashboard");
//   } else {
//     next();
//   }
// });

export default router;

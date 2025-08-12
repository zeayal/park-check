import apiClient from "./index";

export interface Review {
  id: string;
  creatorName: string;
  name: string; // 上传营地名称
  description: string;
  status: "-2" | "-1" | "0" | "1" | "2";
  // -2 已作废：Invalidated
  // -1 已拒绝：Rejected
  // 0 待审核：PendingReview
  // 1 已审核：Approved
  // 2 申请作废：ApplyToInvalidate
  createTime: string;
  updateTime: string;
  address: string;
  images: any[];
  [key: string]: any;
}

export interface DashboardData {
  total: number;
  totalAddApproved: number;
  totalAddPendingReview: number;
  totalEditPendingReview: number;
  totalCommentPendingReview: number;
  recentList?: Review[];
  dailyNewUsersInLastSevenDays: { date: string; count: number }[];
  totalUsers: number;
}

export interface ReviewParams {
  statusList?: string;
  page?: number;
  pageSize?: number;
}

// 定义后端返回的完整结构
interface BackendResponse {
  code: number; // 状态码（0 表示成功）
  message: string; // 提示信息
  data: {
    items: Review[]; // 数据列表（原 items）
    total: number; // 总数（原 total）
  };
}

export interface ReviewResponse {
  items: Review[];
  total: number;
}

// 获取新增旅游线路审核列表
export const getRoutePlanList = async (
  params: ReviewParams
): Promise<ReviewResponse> => {
  const response = await apiClient.get<BackendResponse>(
    "/api/monster/admin/routePlanList",
    { params }
  );
  return {
    items: response.data.data.items,
    total: response.data.data.total,
  };
};

// 批准新增旅游线路
export const approveRoutePlanReviewItem = async (id: string) => {
  const response = await apiClient.post("/api/monster/admin/routePlanApprove", {
    id,
  });
  return response.data;
};

// 作废新增旅游线路
export const invalidateRoutePlanReviewItem = async (id: string) => {
  const response = await apiClient.post("/api/monster/admin/routePlanInvalidate", {
    id,
  });
  return response.data;
};

// 恢复已作废新增旅游线路
export const invalidateToNormalRoutePlanReviewItem = async (id: string) => {
  const response = await apiClient.post("/api/monster/admin/routePlanInvalidateToNormal", {
    id,
  });
  return response.data;
};



// 获取修改旅游线路审核列表
export const getRoutePlanEditList = async (
  params: ReviewParams
): Promise<ReviewResponse> => {
  const response = await apiClient.get<BackendResponse>(
    "/api/monster/admin/getTourRouteRevisionList",
    { params }
  );
  return {
    items: response.data.data.items,
    total: response.data.data.total,
  };
};

// 批准修改旅游线路
export const approveTourRouteRevision = async (revisionId: string) => {
  const response = await apiClient.post("/api/monster/admin/approveTourRouteRevision", {
    revisionId,
  });
  return response.data;
};

// 拒绝修改旅游线路
export const rejectTourRouteRevision = async (revisionId: string, reason: string) => {
  const response = await apiClient.post("/api/monster/admin/rejectTourRouteRevision", {
    revisionId,
    reason
  });
  return response.data;
};



// 获取新增营地审核列表
export const getReviews = async (
  params: ReviewParams
): Promise<ReviewResponse> => {
  const response = await apiClient.get<BackendResponse>(
    "/api/monster/admin/getCampingSiteList",
    { params }
  );
  return {
    items: response.data.data.items,
    total: response.data.data.total,
  };
};

// 获取修改营地审核列表
export const getEditReviews = async (
  params: ReviewParams
): Promise<ReviewResponse> => {
  const response = await apiClient.get<BackendResponse>(
    "/api/monster/admin/getCampingSiteRevisionList",
    { params }
  );
  return {
    items: response.data.data.items,
    total: response.data.data.total,
  };
};

// 获取打卡审核列表
export const getCommentList = async (params: ReviewParams) => {
  const response = await apiClient.get(
    "/api/monster/admin/getCampingCheckInList",
    { params }
  );

  return {
    items: response.data.data.items,
    total: response.data.data.total,
  };
};

// 获取查看详情
export const getReviewById = async (id: string) => {
  const response = await apiClient.get(
    "/api/monster/admin/getCampingSiteDetail",
    {
      params: { id },
    }
  );
  return response.data;
};

// 获取修改详情
export const getRevisionReviewById = async (id: string) => {
  const response = await apiClient.get(
    "/api/monster/admin/getCampingSiteRevisionDetail",
    {
      params: { id },
    }
  );
  return response.data;
};

// 批准新增营地
export const approveReview = async (id: string): Promise<Review> => {
  const response = await apiClient.post<Review>(
    "/api/monster/admin/campingSite/review",
    {
      id,
      status: 1,
    }
  );
  return response.data;
};

// 批准修改营地
export const approveRevisionReview = async (
  revisionId: string
): Promise<Review> => {
  const response = await apiClient.post<Review>(
    "/api/monster/admin/checkApproveCampingSiteRevisionDetail",
    {
      id: revisionId,
    }
  );
  return response.data;
};

// 批准打卡信息
export const approveComment = async (id: number) => {
  const response = await apiClient.post(
    "/api/monster/admin/campingSite/checkIn/approve",
    {
      id,
    }
  );
  return response.data;
};

// 批量批准打卡信息
export const batchApproveComment = async (idList: number[]) => {
  const response = await apiClient.post(
    "/api/monster/admin/campingSite/checkIn/batchApprove",
    { idList }
  );
  return response.data;
};

// 拒绝新增营地
export const rejectReview = async (
  id: string,
  reason: string
): Promise<Review> => {
  const response = await apiClient.post<Review>(
    "/api/monster/admin/campingSite/review",
    {
      id,
      status: -1,
      reason,
    }
  );
  return response.data;
};

// 拒绝修改营地
export const rejectEditCamp = async (id: string, reason: string) => {
  const response = await apiClient.post(
    "/api/monster/admin/campingSite/revisionReject",
    {
      id,
      reason,
    }
  );
  return response.data;
};

// 拒绝打卡信息
export const rejectComment = async (id: number, reason: string) => {
  const response = await apiClient.post(
    "/api/monster/admin/campingSite/checkIn/reject",
    {
      id,
      reason,
    }
  );
  return response.data;
};

// 作废营地
export const invalidCampsite = async (id: string) => {
  const response = await apiClient.post(
    "/api/monster/admin/campingSite/invalidate",
    { id }
  );

  return response.data;
};

// 恢复已作废营地
export const restoreCampsite = async (id: string) => {
  const response = await apiClient.post(
    "/api/monster/admin/campingSite/restoreInvalidateToNormal",
    { id }
  );

  return response.data;
};

// 获取控制面板展示数据
export const getDashbordStatistics = async () => {
  const response = await apiClient.get("/api/monster/admin/dashboard");
  return response.data.data;
};

// 管理员直接修改营地
export const adminEditDetail = async (params: object) => {
  const response = await apiClient.post(
    "/api/monster/admin/campingSite/updateDetailInfo",
    params
  );
  return response.data;
};

// 获取性能监控数据
export const getPerformanceStats = async () => {
  const response = await apiClient.get("/api/monster/admin/performance/stats");
  return response.data;
};

// 获取用户反馈数据
export const getUserFeedback = async () => {
  const response = await apiClient.get("/api/monster/admin/getFeedbackList");
  return response.data;
};

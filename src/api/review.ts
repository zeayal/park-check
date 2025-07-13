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

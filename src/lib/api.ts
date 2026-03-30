import api from "./axios";
import type {
  AuthResponse,
  User,
  Class,
  SelectedClass,
  EnrolledUser,
  SignupPayload,
  SigninPayload,
  ChangePasswordPayload,
  UpdateProfilePayload,
  CreateClassPayload,
  ClassQuery,
  UserQuery,
  ListResponse,
  ApiResponse,
  PaymentIntentResponse,
  CheckoutSessionResponse,
  VerifySessionResponse,
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: async (payload: SignupPayload) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      "/auth/signup",
      payload,
    );
    return data.data!;
  },
  signin: async (payload: SigninPayload) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      "/auth/signin",
      payload,
    );
    return data.data!;
  },
  me: async () => {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data.data!;
  },
  updateMe: async (payload: UpdateProfilePayload) => {
    const { data } = await api.patch<ApiResponse<User>>("/auth/me", payload);
    return data.data!;
  },
  changePassword: async (payload: ChangePasswordPayload) => {
    const { data } = await api.patch<ApiResponse<User>>(
      "/auth/me/change-password",
      payload,
    );
    return data.data!;
  },
  signout: async (refreshToken: string) => {
    await api.post("/auth/signout", { refreshToken });
  },
  signoutAll: async () => {
    await api.post("/auth/signout-all");
  },
};

// ── Classes ───────────────────────────────────────────────────────────────────
export const classesApi = {
  getAll: async (query?: ClassQuery) => {
    const params = new URLSearchParams();
    if (query?.search) params.set("search", query.search);
    if (query?.status) params.set("status", query.status);
    if (query?.sort) params.set("sort", query.sort);
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    const { data } = await api.get<ListResponse<Class[]>>(
      `/classes${qs ? `?${qs}` : ""}`,
    );
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Class>>(`/classes/${id}`);
    return data.data!;
  },
  create: async (payload: CreateClassPayload) => {
    const { data } = await api.post<ApiResponse<Class>>("/classes", payload);
    return data.data!;
  },
  update: async (
    id: string,
    payload: Partial<CreateClassPayload> & {
      status?: string;
      feedback?: string;
    },
  ) => {
    const { data } = await api.patch<ApiResponse<Class>>(
      `/classes/${id}`,
      payload,
    );
    return data.data!;
  },
  delete: async (id: string) => {
    await api.delete(`/classes/${id}`);
  },
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: async (query?: UserQuery) => {
    const params = new URLSearchParams();
    if (query?.search) params.set("search", query.search);
    if (query?.role) params.set("role", query.role);
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    const { data } = await api.get<ListResponse<User[]>>(
      `/users${qs ? `?${qs}` : ""}`,
    );
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data.data!;
  },
  getInstructors: async (limit?: number) => {
    const qs = limit ? `?limit=${limit}` : "";
    const { data } = await api.get<ApiResponse<User[]>>(
      `/users/instructors${qs}`,
    );
    return data.data ?? [];
  },
  update: async (id: string, payload: Partial<User>) => {
    const { data } = await api.patch<ApiResponse<User>>(
      `/users/${id}`,
      payload,
    );
    return data.data!;
  },
  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};

// ── Selected Classes ──────────────────────────────────────────────────────────
export const selectedClassesApi = {
  getAll: async (userEmail?: string) => {
    const qs = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : "";
    const { data } = await api.get<ListResponse<SelectedClass[]>>(
      `/selectedClasses${qs}`,
    );
    return data;
  },
  create: async (payload: {
    userEmail: string;
    instructorEmail: string;
    classID: string;
    classImage?: string;
    className: string;
    price: number;
    enrolledStudents?: number;
  }) => {
    const { data } = await api.post<ApiResponse<SelectedClass>>(
      "/selectedClasses",
      payload,
    );
    return data.data!;
  },
  delete: async (id: string) => {
    await api.delete(`/selectedClasses/${id}`);
  },
};

// ── Enrolled Users ────────────────────────────────────────────────────────────
export const enrolledUsersApi = {
  getAll: async (email?: string) => {
    const qs = email ? `?email=${encodeURIComponent(email)}` : "";
    const { data } = await api.get<ListResponse<EnrolledUser[]>>(
      `/enrolledUsers${qs}`,
    );
    return data;
  },
};

// ── Payment ───────────────────────────────────────────────────────────────────
export const paymentApi = {
  // Legacy: PaymentIntent (kept for reference)
  createIntent: async (price: number) => {
    const { data } = await api.post<PaymentIntentResponse>(
      "/payment/create-payment-intent",
      { price },
    );
    return data.data.clientSecret;
  },

  // New: Stripe Checkout Session — returns { paymentUrl, enrollmentId }
  createCheckout: async (
    selectedClassId: string,
  ): Promise<CheckoutSessionResponse> => {
    const { data } = await api.post<ApiResponse<CheckoutSessionResponse>>(
      "/payment/checkout",
      { selectedClassId },
    );
    return data.data!;
  },

  // Cleanup pending enrollment after user cancels Stripe
  cancelCheckout: async (
    selectedClassId: string,
  ): Promise<{ deleted: number }> => {
    const { data } = await api.post<ApiResponse<{ deleted: number }>>(
      "/payment/cancel",
      { selectedClassId },
    );
    return data.data!;
  },

  // Verify a completed session (called from success page)
  verifySession: async (sessionId: string): Promise<VerifySessionResponse> => {
    const { data } = await api.get<ApiResponse<VerifySessionResponse>>(
      `/payment/verify?session_id=${encodeURIComponent(sessionId)}`,
    );
    return data.data!;
  },
};

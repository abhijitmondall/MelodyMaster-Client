// ── Enums ────────────────────────────────────────────────────────────────────

export type Role = "Student" | "Instructor" | "Admin";
export type ClassStatus = "Pending" | "Approved" | "Denied";
export type SelectedClassStatus = "Selected" | "Enrolled";

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  gender: string | null;
  phoneNumber: string | null;
  address: string | null;
  role: Role;
  classes: number;
  students: number;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role?: "Student" | "Instructor";
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfilePayload {
  name?: string;
  photo?: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
}

// ── Class ─────────────────────────────────────────────────────────────────────

export interface Class {
  id: string;
  classImage: string | null;
  className: string;
  instructorName: string | null;
  instructorEmail: string | null;
  instructorPhoto: string | null;
  description: string | null;
  totalSeats: number;
  enrolledStudents: number;
  availableSeats: number;
  price: number;
  ratings: number;
  status: ClassStatus;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassPayload {
  classImage?: string;
  className: string;
  description?: string;
  instructorName?: string;
  instructorEmail?: string;
  instructorPhoto?: string;
  totalSeats: number;
  price: number;
  ratings?: number;
}

// ── SelectedClass ─────────────────────────────────────────────────────────────

export interface SelectedClass {
  id: string;
  userEmail: string;
  instructorEmail: string;
  classID: string;
  classImage: string | null;
  className: string;
  price: number;
  status: SelectedClassStatus;
  enrolledStudents: number | null;
  createdAt: string;
  updatedAt: string;
}

// ── EnrolledUser ──────────────────────────────────────────────────────────────

export interface EnrolledUser {
  id: string;
  userName: string | null;
  email: string;
  classID: string;
  transactionId: string;
  classImage: string | null;
  className: string;
  price: number;
  enrolledStudents: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  results?: number;
  total?: number;
}

export interface ListResponse<T> {
  success: boolean;
  message: string;
  results: number;
  total: number;
  data: T;
}

export interface PaymentIntentResponse {
  success: boolean;
  message: string;
  data: { clientSecret: string };
}

// ── Stripe Checkout ───────────────────────────────────────────────────────────

export interface CheckoutSessionResponse {
  paymentUrl: string;
  enrollmentId: string;
}

export interface VerifySessionResponse {
  enrollment: EnrolledUser;
  amountPaid: number;
  currency: string;
  customerEmail: string;
  receiptUrl: string | null;
}

// ── Query Params ──────────────────────────────────────────────────────────────

export interface ClassQuery {
  search?: string;
  status?: ClassStatus;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface UserQuery {
  search?: string;
  role?: Role;
  sort?: string;
  page?: number;
  limit?: number;
}

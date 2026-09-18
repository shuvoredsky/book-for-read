export type Role = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AccessStatus = "ACTIVE" | "REVOKED";

export interface SafeUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookInfo {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  totalPages: number;
  isActive: boolean;
}

export interface PaymentSubmission {
  paymentMethod: "bKash" | "Nagad" | "Rocket";
  transactionId: string;
  senderNumber: string;
  amount: number;
  note?: string;
}

export interface BookmarkItem {
  id: string;
  pageNumber: number;
  label?: string | null;
  createdAt: Date;
}

export interface ReadingProgressData {
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  lastReadAt: Date;
}

export interface ReaderState {
  currentPage: number;
  totalPages: number;
  scale: number;
  isFullscreen: boolean;
  isSidebarOpen: boolean;
  searchTerm: string;
  theme: "light" | "dark";
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

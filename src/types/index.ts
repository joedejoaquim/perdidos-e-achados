// User Types
export type UserRole = "finder" | "owner" | "admin";
export type KYCStatus = "pending" | "approved" | "rejected" | "not_started";
export type UserLevel = "bronze" | "silver" | "gold" | "platinum" | "legend";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
  xp: number;
  level: UserLevel;
  rating: number;
  rank_position: number;
  kyc_status: KYCStatus;
  kyc_data?: KYCData;
  verified: boolean;
  created_at: Date;
  updated_at: Date;
}

// Found Items
export type ItemCategory = "document" | "electronic" | "key" | "other" | "cpf" | "cnh" | "credit_card" | "passport";
export type ItemStatus = "available" | "claimed" | "in_delivery" | "delivered" | "closed" | "open";

export interface FoundItem {
  id: string;
  title: string;
  category: ItemCategory;
  description: string;
  photo_url?: string;
  location?: string;
  city?: string;
  state?: string;
  location_lat?: number;
  location_lng?: number;
  finder_id: string;
  status: ItemStatus;
  reward_value: number;
  created_at: Date;
  updated_at: Date;
}

// Claims
export type ClaimStatus = "pending" | "accepted" | "in_delivery" | "completed" | "disputed" | "cancelled";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export interface Claim {
  id: string;
  item_id: string;
  owner_id: string;
  finder_id: string;
  status: ClaimStatus;
  payment_status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}

// Payments
export interface Payment {
  id: string;
  claim_id: string;
  total_amount: number;
  finder_amount: number;
  platform_fee: number;
  status: PaymentStatus;
  provider: string;
  transaction_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Activities
export type ActivityType = "reward_received" | "item_registered" | "badge_earned" | "level_up" | "claim_completed";

export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  description: string;
  value: number;
  created_at: Date;
}

// Badges
export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  xp_required?: number;
  created_at: Date;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: Date;
}

// Notifications
export type NotificationType = "claim_received" | "claim_updated" | "payment_released" | "new_match";

export interface UserNotificationPreferences {
  id?: string;
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  nearby_enabled: boolean;
  weekly_summary: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: Date;
}

// Search & Filtering
export interface SearchFilters {
  category?: ItemCategory;
  city?: string;
  state?: string;
  distance?: number;
  dateFrom?: Date;
  dateTo?: Date;
  minReward?: number;
  maxReward?: number;
}

// Data Transfer Objects
export interface CreateFoundItemDTO {
  title: string;
  category: ItemCategory;
  description: string;
  photo_url?: string;
  location?: string;
  city?: string;
  state?: string;
  location_lat?: number;
  location_lng?: number;
  reward_value: number;
}

export interface CreateClaimDTO {
  item_id: string;
  owner_id: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Gamification
export interface GamificationStats {
  xp: number;
  level: UserLevel;
  rank_position: number;
  total_items_found: number;
  total_items_delivered: number;
  total_reward_earned: number;
  badges: UserBadge[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

// KYC
export interface KYCData {
  full_name: string;
  cpf: string;
  birth_date: Date;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  identity_document_url: string;
  proof_of_address_url: string;
  selfie_url: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_items_found: number;
  total_items_delivered: number;
  pending_claims: number;
  total_earned: number;
  pending_payments: number;
  recent_activities: Activity[];
}

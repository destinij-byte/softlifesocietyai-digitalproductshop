import { apiRequest } from "./client";
import type { BoxType, BoxTierKey, MembershipTier } from "./vault";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  membership_tier: MembershipTier;
  subscription_status: "active" | "canceled" | "none";
  created_at: string;
}

export interface AdminOrder {
  id: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  items: { type: "product" | "bundle"; title: string; price: number }[];
  amount: number;
  created_at: string;
}

export interface AdminBoxSubscriber {
  user_id: string;
  email: string;
  full_name: string;
  box_type: BoxType;
  tier: BoxTierKey;
  created_at: string;
}

export const adminApi = {
  listUsers: () => apiRequest<AdminUser[]>("/vault/admin/users"),
  listOrders: () => apiRequest<AdminOrder[]>("/vault/admin/orders"),
  listBoxSubscribers: () => apiRequest<AdminBoxSubscriber[]>("/vault/admin/boxes/subscribers"),
};

import { apiRequest } from "./client";
import type { MembershipTier } from "./vault";

export interface Me {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  membership_tier: MembershipTier;
}

export const meApi = {
  get: () => apiRequest<Me>("/auth/me"),
};

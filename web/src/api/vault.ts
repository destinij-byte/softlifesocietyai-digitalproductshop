import { apiRequest } from "./client";

export type MembershipTier = "free" | "vault_member" | "elite" | "founding_member";

export type ProductCollection = "soft_life" | "wealth" | "ceo" | "ai" | "inner_life" | "signature";

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  type: string;
  collection: ProductCollection;
  credit_line: string;
  price: number;
  thumbnail_url: string;
  is_ai_resource: boolean;
  is_monthly_drop: boolean;
  is_hero: boolean;
  drop_month: string | null;
}

export interface Bundle {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  products: Product[];
  includes_app_access: boolean;
  is_founding_member: boolean;
  individual_total: number;
  savings: number;
}

export interface LibraryItem {
  product: Product;
  source: "product" | "bundle" | "subscription";
  granted_at: string;
  last_opened_at: string | null;
}

export interface Dashboard {
  welcome_message: string;
  membership_tier: MembershipTier;
  membership_badge: string | null;
  library_count: number;
  new_this_month: Product[];
  continue_your_journey: LibraryItem[];
}

export interface Drop {
  month: string;
  products: Product[];
  unlocked: boolean;
}

export interface Order {
  id: string;
  items: { type: "product" | "bundle"; title: string; price: number }[];
  amount: number;
  created_at: string;
}

export const vaultApi = {
  listProducts: (type?: string) =>
    apiRequest<Product[]>(`/vault/products${type ? `?type=${encodeURIComponent(type)}` : ""}`, { auth: false }),

  getProduct: (idOrSlug: string) => apiRequest<Product>(`/vault/products/${idOrSlug}`, { auth: false }),

  listBundles: () => apiRequest<Bundle[]>("/vault/bundles", { auth: false }),

  getBundle: (idOrSlug: string) => apiRequest<Bundle>(`/vault/bundles/${idOrSlug}`, { auth: false }),

  checkout: (payload: { product_id?: string; bundle_id?: string }) =>
    apiRequest<{ checkout_url: string; session_id: string }>("/vault/checkout", {
      method: "POST",
      body: payload,
    }),

  getDashboard: () => apiRequest<Dashboard>("/vault/dashboard"),

  getLibrary: (type?: string) =>
    apiRequest<LibraryItem[]>(`/vault/library${type ? `?type=${encodeURIComponent(type)}` : ""}`),

  getAiResources: () => apiRequest<LibraryItem[]>("/vault/ai-resources"),

  getDrops: () => apiRequest<Drop[]>("/vault/drops"),

  markOpened: (productId: string) =>
    apiRequest<void>(`/vault/products/${productId}/open`, { method: "POST" }),

  getDownloadUrl: (productId: string) =>
    apiRequest<{ download_url: string; expires_in_seconds: number }>(`/vault/products/${productId}/download`),

  getOrders: () => apiRequest<Order[]>("/vault/orders"),
};

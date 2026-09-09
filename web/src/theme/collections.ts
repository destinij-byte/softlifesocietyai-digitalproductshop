import type { ProductCollection } from "../api/vault";

export interface CollectionMeta {
  label: string;
  emoji: string;
  cardBg: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
}

export const COLLECTIONS: Record<ProductCollection, CollectionMeta> = {
  soft_life: {
    label: "Soft Life Collection",
    emoji: "🌸",
    cardBg: "var(--cream)",
    textColor: "var(--ink)",
    mutedColor: "var(--espresso)",
    accentColor: "var(--blush)",
  },
  wealth: {
    label: "Wealth Collection",
    emoji: "💰",
    cardBg: "var(--cream)",
    textColor: "var(--espresso)",
    mutedColor: "var(--espresso)",
    accentColor: "var(--champagne)",
  },
  ceo: {
    label: "CEO Collection",
    emoji: "👑",
    cardBg: "var(--ink)",
    textColor: "var(--ivory)",
    mutedColor: "var(--champagne)",
    accentColor: "var(--gold)",
  },
  ai: {
    label: "AI Collection",
    emoji: "🤖",
    cardBg: "var(--ink)",
    textColor: "var(--ivory)",
    mutedColor: "var(--champagne)",
    accentColor: "var(--champagne)",
  },
  inner_life: {
    label: "Inner Life Collection",
    emoji: "💕",
    cardBg: "var(--blush)",
    textColor: "var(--ink)",
    mutedColor: "var(--espresso)",
    accentColor: "var(--ivory)",
  },
  signature: {
    label: "Signature Collection",
    emoji: "👑",
    cardBg: "var(--ink)",
    textColor: "var(--ivory)",
    mutedColor: "var(--champagne)",
    accentColor: "var(--champagne)",
  },
};

export const COLLECTION_ORDER: ProductCollection[] = ["soft_life", "wealth", "ceo", "ai", "inner_life", "signature"];

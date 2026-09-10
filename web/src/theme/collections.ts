import type { ProductCollection } from "../api/vault";

export interface CollectionMeta {
  label: string;
  emoji: string;
  cardBg: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
}

// Cream/gold shell throughout, per the light-luxury brand spec - collections
// differentiate through a signature accent color (tab underlines, icons,
// dividers, tags), not through swapping the card background to black.
// "signature" is the one deliberate exception (black + gold, like Academy),
// reserved for the flagship product.
export const COLLECTIONS: Record<ProductCollection, CollectionMeta> = {
  soft_life: {
    label: "Soft Life Collection",
    emoji: "🌸",
    cardBg: "var(--cream)",
    textColor: "var(--espresso)",
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
    cardBg: "var(--soft-pink)",
    textColor: "var(--espresso)",
    mutedColor: "var(--espresso)",
    accentColor: "var(--blush-deep)",
  },
  ai: {
    label: "AI Collection",
    emoji: "🤖",
    cardBg: "var(--cream)",
    textColor: "var(--espresso)",
    mutedColor: "var(--espresso)",
    accentColor: "#c9b6e0", /* soft lilac */
  },
  inner_life: {
    label: "Inner Life Collection",
    emoji: "💕",
    cardBg: "var(--soft-pink)",
    textColor: "var(--espresso)",
    mutedColor: "var(--espresso)",
    accentColor: "#c98fa0", /* dusty rose */
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

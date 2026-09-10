import type { CollectionMeta } from "./collections";
import { COLLECTIONS } from "./collections";

// The AI Collection product catalog didn't change, but the Shop now
// presents it as named sub-brand shelves instead of one flat list, per the
// brand redesign spec. This is a display-only remap keyed by product slug -
// no backend/data model change needed. Study Muse and Florida Property are
// intentionally omitted: there's no real product content for them yet.
const aiBase = COLLECTIONS.ai;

function shelf(label: string, emoji: string, accentColor: string): CollectionMeta {
  return { ...aiBase, label, emoji, accentColor };
}

export const AI_SHELVES: Record<string, CollectionMeta> = {
  "content-creator-ai-prompt-pack": shelf("Creator Muse", "🎬", "#c9b6e0"),
  "ceo-ai-prompt-pack": shelf("CEO Girl", "👑", "var(--blush-deep)"),
  "money-ai-prompt-pack": shelf("Money Muse", "💸", "var(--champagne)"),
  "dating-relationships-ai-prompt-pack": shelf("Her New Era", "💗", "#c98fa0"),
  "home-lifestyle-ai-prompt-pack": shelf("Home Reset", "🏡", "#9caf88"),
};

export const AI_SHELF_ORDER = [
  "content-creator-ai-prompt-pack",
  "ceo-ai-prompt-pack",
  "money-ai-prompt-pack",
  "dating-relationships-ai-prompt-pack",
  "home-lifestyle-ai-prompt-pack",
];

export const AI_SHELF_FALLBACK_LABEL = "AI Prompts";

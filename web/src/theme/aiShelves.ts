import type { CollectionMeta } from "./collections";
import { COLLECTIONS } from "./collections";

// The AI Collection product catalog didn't change conceptually, but the Shop
// presents it as named sub-brand shelves instead of one flat list, per the
// brand redesign spec. This is a display-only remap keyed by product slug -
// no backend/data model change needed (all of these products still live in
// the "ai" collection / "ai" life area). Each shelf can hold multiple
// products - Study Muse's shelf launches with a full lineup and no single
// "hero" prompt pack the way the earlier shelves did.
const aiBase = COLLECTIONS.ai;

function shelf(label: string, emoji: string, accentColor: string): CollectionMeta {
  return { ...aiBase, label, emoji, accentColor };
}

export interface AiShelfDef {
  meta: CollectionMeta;
  /** Product slugs that belong on this shelf, in display order. */
  slugs: string[];
}

export const AI_SHELVES: Record<string, AiShelfDef> = {
  "creator-muse": {
    meta: shelf("Creator Muse", "🎬", "#c9b6e0"),
    slugs: [
      "creator-muse-30-day-content-calendar",
      "creator-muse-hooks-templates",
      "creator-muse-caption-vault",
      "creator-muse-reels-tiktok-script-pack",
      "content-creator-ai-prompt-pack",
      "creator-muse-ai-prompt-pack",
    ],
  },
  "ceo-girl": {
    meta: shelf("CEO Girl", "👑", "var(--blush-deep)"),
    slugs: [
      "ceo-girl-idea-finder",
      "ceo-girl-offer-builder",
      "ceo-girl-ideal-customer-profile",
      "ceo-girl-pricing-calculator",
      "ceo-girl-30-day-launch-system",
      "ceo-girl-content-marketing-kit",
      "ceo-ai-prompt-pack",
    ],
  },
  "money-muse": {
    meta: shelf("Money Muse", "💸", "var(--champagne)"),
    slugs: [
      "money-muse-money-reset-workbook",
      "money-muse-ultimate-budget-planner",
      "money-muse-debt-freedom-tracker",
      "money-muse-savings-goal-planner",
      "money-ai-prompt-pack",
      "money-muse-ai-prompt-pack",
    ],
  },
  "her-new-era": {
    meta: shelf("Her New Era", "💗", "#c98fa0"),
    slugs: [
      "her-new-era-30-day-life-reset",
      "her-new-era-identity-reset",
      "her-new-era-habit-builder",
      "her-new-era-confidence-rebuild",
      "her-new-era-goal-to-action-planner",
      "her-new-era-future-self-ai-kit",
      "dating-relationships-ai-prompt-pack",
    ],
  },
  "home-reset": {
    meta: shelf("Home Reset", "🏡", "#9caf88"),
    slugs: [
      "home-reset-whole-home-reset",
      "home-reset-declutter-challenge",
      "home-reset-cleaning-system",
      "home-reset-room-organization-planner",
      "home-reset-moving-planner",
      "home-lifestyle-ai-prompt-pack",
    ],
  },
  "study-muse": {
    meta: shelf("Study Muse", "🎓", "#8fa7c9"),
    slugs: [
      "study-muse-ai-schedule-builder",
      "study-muse-exam-prep-system",
      "study-muse-30-day-exam-countdown",
      "study-muse-active-recall-study-kit",
      "study-muse-finals-week-survival-system",
      "study-muse-ai-prompt-kit",
    ],
  },
};

export const AI_SHELF_ORDER = [
  "creator-muse",
  "ceo-girl",
  "money-muse",
  "her-new-era",
  "home-reset",
  "study-muse",
];

export const AI_SHELF_FALLBACK_LABEL = "AI Prompts";

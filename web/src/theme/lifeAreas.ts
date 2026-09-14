import type { LifeArea } from "../api/vault";

export interface LifeAreaMeta {
  label: string;
  emoji: string;
  description: string;
}

export const LIFE_AREAS: Record<LifeArea, LifeAreaMeta> = {
  soft_life: {
    label: "My Soft Life",
    emoji: "🌸",
    description: "The foundation — her routines, resets, and the intentional life she's building day by day.",
  },
  goals: {
    label: "My Goals",
    emoji: "🎯",
    description: "Every goal she's chasing, broken into a plan she can actually follow.",
  },
  money: {
    label: "My Money",
    emoji: "💰",
    description: "Her relationship with money, reset and rebuilt on her terms.",
  },
  ceo_life: {
    label: "My CEO Life",
    emoji: "👑",
    description: "The tools to run her business, her brand, her empire.",
  },
  ai: {
    label: "My AI",
    emoji: "🤖",
    description: "AI-assisted prompts and resources for every side of her life.",
  },
  inner_life: {
    label: "My Inner Life",
    emoji: "💕",
    description: "Her mindset, her confidence, her private space to think.",
  },
  challenges: {
    label: "Challenges",
    emoji: "✨",
    description: "Streaks, structure, and a little accountability.",
  },
};

export const LIFE_AREA_ORDER: LifeArea[] = ["soft_life", "goals", "money", "ceo_life", "ai", "inner_life", "challenges"];

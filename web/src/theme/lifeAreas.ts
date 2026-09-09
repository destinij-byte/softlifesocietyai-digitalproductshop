import type { LifeArea } from "../api/vault";

export interface LifeAreaMeta {
  label: string;
  emoji: string;
}

export const LIFE_AREAS: Record<LifeArea, LifeAreaMeta> = {
  soft_life: { label: "My Soft Life", emoji: "🌸" },
  goals: { label: "My Goals", emoji: "🎯" },
  money: { label: "My Money", emoji: "💰" },
  ceo_life: { label: "My CEO Life", emoji: "👑" },
  ai: { label: "My AI", emoji: "🤖" },
  inner_life: { label: "My Inner Life", emoji: "💕" },
  challenges: { label: "Challenges", emoji: "✨" },
};

export const LIFE_AREA_ORDER: LifeArea[] = ["soft_life", "goals", "money", "ceo_life", "ai", "inner_life", "challenges"];

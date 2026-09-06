/**
 * Shared SLS design tokens. Academy pulls colors from here rather than a
 * re-created palette - swap these hexes for the app's real theme file if
 * one already exists elsewhere in the codebase.
 */
export const colors = {
  ivory: "#FBF7F2",
  cream: "#F5EDE4",
  blush: "#F0C9C9",
  gold: "#C9A15E",
  rose: "#D9A6A6",
  ink: "#2B2521",
} as const;

export type ColorToken = keyof typeof colors;

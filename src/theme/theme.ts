// src/theme/theme.ts
export const theme = {
  colors: {
    bg: "#070A12",
    surface: "#0C1220",
    surface2: "#0F1A2E",
    text: "#EAF2FF",
    muted: "#A7B4C8",
    line: "rgba(255,255,255,0.08)",
    primary: "#57D7FF",   // cian futurista
    accent: "#8B5CFF",    // violeta neon
    good: "#3DFFB5",
    warn: "#FFB84D",
    bad: "#FF4D6D",
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 22,
    xl: 28,
  },
  spacing: (n: number) => n * 8,
  shadow: {
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
  },
} as const;

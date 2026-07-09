import type { EggId, EggOption } from "@/domain/pet";

export type EggTheme = {
  dark: string;
  deep: string;
  mid: string;
  light: string;
  hot: string;
  soft: string;
};

const THEME_OVERRIDES: Partial<Record<EggId, EggTheme>> = {
  zodiac_rat: { dark: "#141b2c", deep: "#243148", mid: "#7c8aa5", light: "#eef5ff", hot: "#d8e2f7", soft: "#f6f8fd" },
  zodiac_ox: { dark: "#102519", deep: "#1f3d2f", mid: "#3c8f68", light: "#edfff3", hot: "#a7f0c1", soft: "#f2fbf5" },
  zodiac_tiger: { dark: "#2b1008", deep: "#4a2a14", mid: "#f97316", light: "#fff3dc", hot: "#ffb15c", soft: "#fff7ec" },
  zodiac_rabbit: { dark: "#291724", deep: "#4a2637", mid: "#ef7da8", light: "#fff7fb", hot: "#ffc0d4", soft: "#fff5f8" },
  zodiac_dragon: { dark: "#082330", deep: "#164052", mid: "#0891b2", light: "#ecfeff", hot: "#67e8f9", soft: "#eefbfc" },
  zodiac_snake: { dark: "#09251e", deep: "#173d35", mid: "#10a37f", light: "#effff8", hot: "#5eead4", soft: "#effaf6" },
  zodiac_horse: { dark: "#2b1a0e", deep: "#49301d", mid: "#d97706", light: "#fff6eb", hot: "#fdba74", soft: "#fff7ef" },
  zodiac_goat: { dark: "#2b2211", deep: "#4b3a20", mid: "#d6a449", light: "#fffaf0", hot: "#fde68a", soft: "#fffaf1" },
  zodiac_monkey: { dark: "#1f1635", deep: "#352456", mid: "#8b5cf6", light: "#f7f2ff", hot: "#c4b5fd", soft: "#f7f3ff" },
  zodiac_rooster: { dark: "#35131b", deep: "#4d2430", mid: "#f43f5e", light: "#fff8e5", hot: "#fbbf24", soft: "#fff8ee" },
  zodiac_dog: { dark: "#111b34", deep: "#25345d", mid: "#4f6fda", light: "#f0f6ff", hot: "#93c5fd", soft: "#f3f7ff" },
  zodiac_pig: { dark: "#351723", deep: "#542536", mid: "#fb7185", light: "#fff1f4", hot: "#fda4af", soft: "#fff5f7" },
  windfire: { dark: "#1c0704", deep: "#541c14", mid: "#ef4444", light: "#fff1e7", hot: "#f97316", soft: "#fff4ed" },
  moonjade: { dark: "#181638", deep: "#2f2b5f", mid: "#818cf8", light: "#f6f7ff", hot: "#c4b5fd", soft: "#f6f5ff" },
  mechlion: { dark: "#260b0b", deep: "#4a1d1d", mid: "#dc2626", light: "#fff8e6", hot: "#fbbf24", soft: "#fff7e8" },
  lotusguard: { dark: "#09231f", deep: "#17433d", mid: "#14b8a6", light: "#effffb", hot: "#5eead4", soft: "#effbf8" },
  aurora: { dark: "#321807", deep: "#4d2c17", mid: "#ff8a4d", light: "#fff4db", hot: "#ffd166", soft: "#fff8e9" },
  sprout: { dark: "#0c2418", deep: "#1c3f2b", mid: "#31b56a", light: "#ecfff2", hot: "#86efac", soft: "#f0fbf3" },
  tide: { dark: "#071b35", deep: "#17355e", mid: "#3b82f6", light: "#edf7ff", hot: "#7dd3fc", soft: "#f0f8ff" },
};

export function getEggTheme(egg: EggOption): EggTheme {
  return (
    THEME_OVERRIDES[egg.id] || {
      dark: egg.palette.ink,
      deep: egg.palette.body,
      mid: egg.palette.accent,
      light: egg.palette.glow,
      hot: egg.palette.accent,
      soft: egg.palette.shell,
    }
  );
}

export function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((item) => item + item)
          .join("")
      : normalized;
  const number = Number.parseInt(value, 16);

  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}

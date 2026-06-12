/* White-label brand engine — turns a tenant's BrandConfig into runtime CSS
   variables. Everything inside [data-brand-scope] re-skins instantly. */

import type { BrandConfig } from "../types";

export const DEFAULT_BRAND: BrandConfig = {
  color: "#0a0a0b",
  mode: "light",
  radius: "soft",
  font: "modern",
};

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return [10, 10, 11];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;
}

/** Mix `hex` toward `to` by t (0..1). */
export function mix(hex: string, to: string, t: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(to);
  return rgbToHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** White or near-black text, whichever reads on the brand color. */
export function readableOn(hex: string): string {
  return luminance(hex) > 0.42 ? "#0a0a0b" : "#ffffff";
}

export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const RADII: Record<BrandConfig["radius"], string> = {
  sharp: "0.375rem",
  soft: "0.75rem",
  round: "1.25rem",
};

const FONTS: Record<BrandConfig["font"], { sans: string; display: string }> = {
  modern: {
    sans: 'var(--font-inter), "Segoe UI", system-ui, sans-serif',
    display: 'var(--font-inter), "Segoe UI", system-ui, sans-serif',
  },
  grotesk: {
    sans: 'var(--font-inter), "Segoe UI", system-ui, sans-serif',
    display: 'var(--font-space), var(--font-inter), system-ui, sans-serif',
  },
  classic: {
    sans: 'var(--font-inter), "Segoe UI", system-ui, sans-serif',
    display: 'Georgia, "Times New Roman", serif',
  },
};

/** CSS custom properties for a brand — apply to a wrapper element's style. */
export function brandVars(brand: BrandConfig): Record<string, string> {
  const c = brand.color || DEFAULT_BRAND.color;
  const fonts = FONTS[brand.font] ?? FONTS.modern;
  const vars: Record<string, string> = {
    "--brand": c,
    "--brand-strong": mix(c, "#000000", 0.22),
    "--brand-soft": mix(c, "#ffffff", 0.92),
    "--brand-softer": mix(c, "#ffffff", 0.97),
    "--brand-ring": rgba(c, 0.16),
    "--brand-fg": readableOn(c),
    "--brand-muted": mix(c, "#6b7280", 0.55),
    "--radius-brand": RADII[brand.radius] ?? RADII.soft,
    "--font-sans": fonts.sans,
    "--font-display": fonts.display,
  };
  if (brand.color2) vars["--brand-2"] = brand.color2;
  return vars;
}

/** Curated starter palettes shown in the onboarding wizard. */
export const BRAND_PRESETS: Array<{ name: string; color: string; color2?: string }> = [
  { name: "Jet", color: "#0a0a0b" },
  { name: "Royal", color: "#1f56a8", color2: "#4dabf7" },
  { name: "Electric", color: "#1d9bf0" },
  { name: "Violet", color: "#7c3aed", color2: "#c4b5fd" },
  { name: "Emerald", color: "#059669", color2: "#6ee7b7" },
  { name: "Crimson", color: "#dc2626" },
  { name: "Sunset", color: "#ea580c", color2: "#fdba74" },
  { name: "Rose", color: "#db2777", color2: "#f9a8d4" },
  { name: "Gold", color: "#b45309", color2: "#d4af37" },
  { name: "Teal", color: "#0d9488" },
  { name: "Slate", color: "#475569" },
  { name: "Indigo", color: "#4338ca" },
];

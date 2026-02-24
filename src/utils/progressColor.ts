/**
 * Interpolates HSL color based on progress percentage (0-100).
 * Color stops: carmim → coral → dourado → verde → verde vibrante
 */

interface HSL {
  h: number;
  s: number;
  l: number;
}

const COLOR_STOPS: { pct: number; color: HSL }[] = [
  { pct: 0,   color: { h: 348, s: 66, l: 29 } },
  { pct: 25,  color: { h: 20,  s: 60, l: 50 } },
  { pct: 50,  color: { h: 46,  s: 64, l: 52 } },
  { pct: 75,  color: { h: 120, s: 40, l: 45 } },
  { pct: 100, color: { h: 142, s: 55, l: 42 } },
];

function lerpHSL(a: HSL, b: HSL, t: number): HSL {
  return {
    h: a.h + (b.h - a.h) * t,
    s: a.s + (b.s - a.s) * t,
    l: a.l + (b.l - a.l) * t,
  };
}

function interpolate(pct: number, stops: typeof COLOR_STOPS): HSL {
  const clamped = Math.max(0, Math.min(100, pct));
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped <= stops[i + 1].pct) {
      const range = stops[i + 1].pct - stops[i].pct;
      const t = (clamped - stops[i].pct) / range;
      return lerpHSL(stops[i].color, stops[i + 1].color, t);
    }
  }
  return stops[stops.length - 1].color;
}

/** Returns the progress bar color as an HSL string */
export function getProgressBarColor(pct: number): string {
  const { h, s, l } = interpolate(pct, COLOR_STOPS);
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

/** Returns a subtle background color (high luminosity) based on progress */
export function getProgressBgColor(pct: number): string {
  const { h, s } = interpolate(pct, COLOR_STOPS);
  // Keep luminosity very high (93-95%) and saturation low for subtlety
  const bgL = 94 - (pct / 100) * 2; // 94% → 92%
  const bgS = Math.round(s * 0.3); // 30% of the bar saturation
  return `hsl(${Math.round(h)}, ${bgS}%, ${Math.round(bgL)}%)`;
}

/** Returns current phase (1-5) based on question index (0-based) and total */
export function getPhase(questionIndex: number, total: number): number {
  const phaseSize = Math.ceil(total / 5);
  return Math.min(5, Math.floor(questionIndex / phaseSize) + 1);
}

/* =========================
   CATEGORY COLOR TOKENS (V2.0 PREMIUM)
   ========================= */

export const CATEGORY_COLOR_STYLES = {

  brown: {
    dot: "bg-[#8B5A2B] shadow-[0_0_8px_rgba(139,90,43,0.4)]",
    badge: "bg-[#F3E9DF] text-[#5C3A1E] border-[#E4D3C3] font-black",
  },

  cyan: {
    dot: "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-100 font-black",
  },
  emerald: {
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100 font-black",
  },
  violet: {
    dot: "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]",
    badge: "bg-violet-50 text-violet-700 border-violet-100 font-black",
  },
  rose: {
    dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
    badge: "bg-rose-50 text-rose-700 border-rose-100 font-black",
  },
  amber: {
    dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    badge: "bg-amber-50 text-amber-700 border-amber-100 font-black",
  },
  orange: {
    dot: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]",
    badge: "bg-orange-50 text-orange-700 border-orange-100 font-black",
  },
  indigo: {
    dot: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-100 font-black",
  },
  slate: {
    dot: "bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.4)]",
    badge: "bg-slate-100 text-slate-700 border-slate-200 font-black",
  },

  blue: {
    dot: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
    badge: "bg-blue-50 text-blue-700 border-blue-100 font-black",
  },
  pink: {
    dot: "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]",
    badge: "bg-pink-50 text-pink-700 border-pink-100 font-black",
  },
  lime: {
    dot: "bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.4)]",
    badge: "bg-lime-50 text-lime-700 border-lime-100 font-black",
  },
} as const;

export type CategoryColor = keyof typeof CATEGORY_COLOR_STYLES;

export function toCategoryColor(value?: string | null): CategoryColor {
  if (!value) return "slate";
  if (Object.prototype.hasOwnProperty.call(CATEGORY_COLOR_STYLES, value)) {
    return value as CategoryColor;
  }
  return "slate";
}
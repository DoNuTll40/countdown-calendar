// ============================================================
// constants.js — ค่าคงที่ทั้งหมดของแอป
// ============================================================

export const THEMES = {
  blue: { bgLight: 'bg-blue-50', bgDark: 'bg-blue-500/20', textLight: 'text-blue-600', textDark: 'text-blue-400', borderLight: 'border-blue-200', borderDark: 'border-blue-500/30', hex: '#2563eb' },
  emerald: { bgLight: 'bg-emerald-50', bgDark: 'bg-emerald-500/20', textLight: 'text-emerald-600', textDark: 'text-emerald-400', borderLight: 'border-emerald-200', borderDark: 'border-emerald-500/30', hex: '#10b981' },
  violet: { bgLight: 'bg-violet-50', bgDark: 'bg-violet-500/20', textLight: 'text-violet-600', textDark: 'text-violet-400', borderLight: 'border-violet-200', borderDark: 'border-violet-500/30', hex: '#8b5cf6' },
  rose: { bgLight: 'bg-rose-50', bgDark: 'bg-rose-500/20', textLight: 'text-rose-600', textDark: 'text-rose-400', borderLight: 'border-rose-200', borderDark: 'border-rose-500/30', hex: '#e11d48' }
};

export const FONT_SIZE_PX = { sm: 14, base: 16, lg: 19 };

export const VALID_TABS = ['dashboard', 'timeline', 'settings'];

export const UPCOMING_COUNT_OPTIONS = [3, 5, 10];

export const RATIOS = {
  '1:1': { width: 1080, height: 1080, label: 'Square (1:1)' },
  '4:5': { width: 1080, height: 1350, label: 'IG Post (4:5)' },
  '9:16': { width: 1080, height: 1920, label: 'Story (9:16)' },
  '16:9': { width: 1920, height: 1080, label: 'Landscape (16:9)' }
};

export const BACKGROUNDS = [
  { id: 'solid-dark', class: 'bg-slate-900', label: 'Dark' },
  { id: 'solid-light', class: 'bg-slate-50', label: 'Light' },
  { id: 'grad-blue', class: 'bg-gradient-to-br from-blue-600 to-violet-600', label: 'Blue Grad' },
  { id: 'grad-rose', class: 'bg-gradient-to-br from-rose-500 to-orange-400', label: 'Rose Grad' },
  { id: 'grad-emerald', class: 'bg-gradient-to-br from-emerald-500 to-teal-700', label: 'Emerald Grad' }
];

export const ENV = {
  GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',
  CALENDAR_ID: import.meta.env.VITE_CALENDAR_ID || '',
  NEON_DB_STRING: import.meta.env.VITE_NEON_DB_STRING || ''
};

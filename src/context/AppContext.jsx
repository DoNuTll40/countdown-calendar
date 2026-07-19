// ============================================================
// context/AppContext.jsx — Theme & Preferences Context
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { THEMES, FONT_SIZE_PX, TRANSLATIONS } from '../constants';

const AppContext = createContext(null);

const DEFAULT_PREFS = { theme: 'blue', fontSize: 'base', darkMode: false, navSize: 'md', upcomingCount: 3, lang: 'th' };

const loadPrefs = () => {
  try {
    const saved = localStorage.getItem('app_preferences');
    const parsed = saved ? JSON.parse(saved) : {};
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS };
  }
};

export function AppProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs);

  const handleSavePrefs = useCallback((newPrefs) => {
    setPrefs(newPrefs);
    localStorage.setItem('app_preferences', JSON.stringify(newPrefs));
  }, []);

  // Apply body background on dark mode change
  useEffect(() => {
    document.body.style.backgroundColor = prefs.darkMode ? '#0f172a' : '#fafafa';
  }, [prefs.darkMode]);

  // Apply font size on change
  useEffect(() => {
    document.documentElement.style.fontSize = `${FONT_SIZE_PX[prefs.fontSize] || FONT_SIZE_PX.base}px`;
  }, [prefs.fontSize]);

  // Derived theme classes — memoized
  const theme = useMemo(() => {
    const isDark = prefs.darkMode;
    const activeTheme = THEMES[prefs.theme] || THEMES.blue;

    return {
      isDark,
      activeTheme,
      themeHex: activeTheme.hex,

      // Card / layout classes
      c_bgMain: isDark ? 'bg-slate-900' : 'bg-slate-50',
      c_textMain: isDark ? 'text-slate-100' : 'text-slate-900',
      c_textSub: isDark ? 'text-slate-400' : 'text-slate-500',
      c_cardBg: isDark ? 'bg-slate-800' : 'bg-white',
      c_cardBorder: isDark ? 'border-slate-700' : 'border-slate-200',
      c_cardShadow: isDark ? 'shadow-none' : 'shadow-sm',
      c_headerBg: isDark ? 'bg-slate-900/80' : 'bg-white/70',
      c_navBg: isDark ? 'bg-slate-800/90' : 'bg-white/90',

      // Theme accent classes
      t_bg: isDark ? activeTheme.bgDark : activeTheme.bgLight,
      t_text: isDark ? activeTheme.textDark : activeTheme.textLight,
      t_border: isDark ? activeTheme.borderDark : activeTheme.borderLight,
    };
  }, [prefs.darkMode, prefs.theme]);

  // Nav size classes
  const navStyles = useMemo(() => {
    if (prefs.navSize === 'sm') return { container: 'max-w-[16.25rem] p-1.5', icon: 'w-[1.125rem] h-[1.125rem]', text: 'text-[0.5625rem] mt-0.5' };
    if (prefs.navSize === 'lg') return { container: 'max-w-[22.5rem] p-2.5', icon: 'w-[1.625rem] h-[1.625rem]', text: 'text-[0.75rem] mt-1' };
    return { container: 'max-w-[20rem] p-2', icon: 'w-[1.375rem] h-[1.375rem]', text: 'text-[0.625rem] mt-1' };
  }, [prefs.navSize]);

  const lang = useMemo(() => prefs.lang || 'th', [prefs.lang]);
  const L = useMemo(() => TRANSLATIONS[lang] || TRANSLATIONS.th, [lang]);

  const value = useMemo(() => ({
    prefs,
    handleSavePrefs,
    ...theme,
    navStyles,
    lang,
    L
  }), [prefs, handleSavePrefs, theme, navStyles, lang, L]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

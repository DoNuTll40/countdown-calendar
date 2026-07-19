// ============================================================
// components/SettingsView.jsx — Settings page
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, Palette, Type, Moon, Sun, Scaling,
  ListFilter, CheckCircle2, Globe
} from 'lucide-react';
import { THEMES, UPCOMING_COUNT_OPTIONS } from '../constants';
import { useAppContext } from '../context/AppContext';

export default function SettingsView() {
  const {
    prefs, handleSavePrefs, isDark,
    c_cardBg, c_cardBorder, c_cardShadow, c_textMain, c_textSub,
    t_bg, t_text, t_border, activeTheme, lang, L
  } = useAppContext();

  return (
    <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h2 className="text-2xl font-semibold mb-6">{L.appSettings}</h2>
      <div className="space-y-6">

        {/* Language Selection */}
        <div className={`${c_cardBg} rounded-3xl p-6 border ${c_cardBorder} ${c_cardShadow} transition-colors duration-300`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} flex items-center justify-center`}>
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium">{L.language}</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleSavePrefs({ ...prefs, lang: 'th' })} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${lang === 'th' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>
              🇹🇭 ไทย
            </button>
            <button onClick={() => handleSavePrefs({ ...prefs, lang: 'en' })} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${lang === 'en' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* Dark Mode + Theme Color */}
        <div className={`${c_cardBg} rounded-3xl p-6 border ${c_cardBorder} ${c_cardShadow} transition-colors duration-300`}>
          {/* Dark Mode Toggle */}
          <div className={`flex items-center justify-between mb-6 pb-6 border-b ${c_cardBorder}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${prefs.darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-50 text-amber-500'} flex items-center justify-center`}>{prefs.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</div>
              <div><h3 className="font-medium">{L.darkMode}</h3><p className={`text-[0.625rem] ${c_textSub}`}>{L.darkModeDesc}</p></div>
            </div>
            <button onClick={() => handleSavePrefs({ ...prefs, darkMode: !prefs.darkMode })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} style={prefs.darkMode ? { backgroundColor: activeTheme.hex } : {}}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs.darkMode ? 'translate-x-6' : 'translate-x-1'}`} /></button>
          </div>
          {/* Theme Color */}
          <div className="flex items-center gap-3 mb-4"><div className={`w-10 h-10 rounded-xl ${t_bg} ${t_text} flex items-center justify-center`}><Palette className="w-5 h-5" /></div><div><h3 className="font-medium">{L.themeColor}</h3></div></div>
          <div className="flex gap-4">
            {Object.keys(THEMES).map((themeKey) => (
              <button key={themeKey} onClick={() => handleSavePrefs({ ...prefs, theme: themeKey })} className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${prefs.theme === themeKey ? (isDark ? 'border-white scale-110 shadow-md' : 'border-slate-800 scale-110 shadow-md') : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: THEMES[themeKey].hex }}>{prefs.theme === themeKey && <CheckCircle2 className="w-5 h-5 text-white" />}</button>
            ))}
          </div>
        </div>

        {/* Font Size + Nav Size */}
        <div className={`${c_cardBg} rounded-3xl p-6 border ${c_cardBorder} ${c_cardShadow} transition-colors duration-300`}>
          <div className="flex items-center gap-3 mb-4"><div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} flex items-center justify-center`}><Type className="w-5 h-5" /></div><div><h3 className="font-medium">{L.fontSize}</h3></div></div>
          <div className={`grid grid-cols-3 gap-3 mb-6 pb-6 border-b ${c_cardBorder}`}>
            <button onClick={() => handleSavePrefs({ ...prefs, fontSize: 'sm' })} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${prefs.fontSize === 'sm' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>{L.fontSmall}</button>
            <button onClick={() => handleSavePrefs({ ...prefs, fontSize: 'base' })} className={`py-2.5 rounded-xl border text-base font-medium transition-colors ${prefs.fontSize === 'base' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>{L.fontNormal}</button>
            <button onClick={() => handleSavePrefs({ ...prefs, fontSize: 'lg' })} className={`py-2.5 rounded-xl border text-lg font-medium transition-colors ${prefs.fontSize === 'lg' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>{L.fontLarge}</button>
          </div>
          <div className="flex items-center gap-3 mb-4"><div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} flex items-center justify-center`}><Scaling className="w-5 h-5" /></div><div><h3 className="font-medium">{L.bottomNavSize}</h3></div></div>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => handleSavePrefs({ ...prefs, navSize: 'sm' })} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${prefs.navSize === 'sm' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>{L.fontSmall}</button>
            <button onClick={() => handleSavePrefs({ ...prefs, navSize: 'md' })} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${prefs.navSize === 'md' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>{L.fontNormal}</button>
            <button onClick={() => handleSavePrefs({ ...prefs, navSize: 'lg' })} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${prefs.navSize === 'lg' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>{L.fontLarge}</button>
          </div>
        </div>

        {/* Upcoming Count */}
        <div className={`${c_cardBg} rounded-3xl p-6 border ${c_cardBorder} ${c_cardShadow} transition-colors duration-300`}>
          <div className="flex items-center gap-3 mb-4"><div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} flex items-center justify-center`}><ListFilter className="w-5 h-5" /></div><div><h3 className="font-medium">{L.upcomingCountLabel}</h3><p className={`text-[0.625rem] ${c_textSub}`}>{L.upcomingCountDesc}</p></div></div>
          <div className="grid grid-cols-3 gap-3">
            {UPCOMING_COUNT_OPTIONS.map(n => <button key={n} onClick={() => handleSavePrefs({ ...prefs, upcomingCount: n })} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${prefs.upcomingCount === n ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>{n} {L.items}</button>)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-14 pb-0 flex flex-col items-center justify-center text-center">
        <div className={`w-12 h-12 rounded-2xl ${t_bg} ${t_text} flex items-center justify-center mb-3 shadow-sm`}><CalendarDays className="w-6 h-6" /></div>
        <h3 className="font-semibold tracking-tight text-base mb-1 flex items-center justify-center gap-1">Countdown<span className={t_text}>.</span></h3>
        <p className={`text-xs ${c_textSub} mb-5`}>Version 1.2.0</p>
        <div className={`text-[0.625rem] ${c_textSub} space-y-1.5`}><p>Crafted by CS64'125 Nuttawoot Chawna</p><p>© {new Date().getFullYear()} All rights reserved.</p></div>
      </div>
    </motion.div>
  );
}

// ============================================================
// components/Header.jsx — Sticky header bar
// ============================================================

import React from 'react';
import { useAppContext } from '../context/AppContext';

export default function Header({ dbStatus }) {
  const { c_headerBg, c_cardBorder, c_cardBg, c_textSub, t_text } = useAppContext();

  return (
    <header className={`sticky top-0 z-40 ${c_headerBg} backdrop-blur-xl border-b ${c_cardBorder} px-5 py-4 transition-colors duration-300`} style={{ transform: 'translateZ(0)' }}>
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">Countdown<span className={t_text}>.</span></h1>
        <div className={`flex items-center gap-2 text-xs font-medium ${c_cardBg} px-3 py-1.5 rounded-full shadow-sm border ${c_cardBorder}`}>
          <span className={`w-2 h-2 rounded-full ${dbStatus === 'online' ? `bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]` : 'bg-slate-400'}`}></span>
          <span className={c_textSub}>{dbStatus === 'online' ? 'Neon Sync' : 'Local Mode'}</span>
        </div>
      </div>
    </header>
  );
}

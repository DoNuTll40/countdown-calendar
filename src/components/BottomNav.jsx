// ============================================================
// components/BottomNav.jsx — Bottom navigation bar
// ============================================================

import React from 'react';
import { Home, CalendarDays, Settings } from 'lucide-react';
import Ripple from '@nuttawoot_donut/react-ripple';
import { useAppContext } from '../context/AppContext';

const ripple = new Ripple();

export default function BottomNav({ activeTab, onTabChange }) {
  const { isDark, c_navBg, c_cardBorder, c_textSub, t_bg, t_text, navStyles } = useAppContext();

  const tabs = [
    { id: 'dashboard', icon: Home, label: 'หน้าแรก' },
    { id: 'timeline', icon: CalendarDays, label: 'กำหนดการ' },
    { id: 'settings', icon: Settings, label: 'ตั้งค่า' },
  ];

  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none px-4 transition-all duration-300">
      <nav className={`pointer-events-auto ${c_navBg} backdrop-blur-2xl border ${isDark ? 'border-slate-700/60 shadow-[0_8px_30px_rgba(0,0,0,0.4)]' : 'border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)]'} rounded-[2rem] flex items-center justify-between w-full transition-all duration-300 ${navStyles.container}`}>
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onMouseDown={(e) => ripple.create(e)}
            onClick={() => onTabChange(id)}
            className={`relative overflow-hidden flex flex-col items-center justify-center w-1/3 py-2 rounded-[1.5rem] transition-all duration-300 ${activeTab === id ? `${t_bg} ${t_text}` : `${c_textSub} ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}`}
          >
            <Icon className={`${navStyles.icon}`} strokeWidth={activeTab === id ? 2.5 : 2} />
            <span className={`font-semibold tracking-wide ${navStyles.text}`}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

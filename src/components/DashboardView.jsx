// ============================================================
// components/DashboardView.jsx — Hero card + upcoming list
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Star, Clock, Loader2, Repeat, Image as ImageIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatEventDateRange, hasRealLocation, isMultiDay, formatLocationForLang } from '../utils';
import CountdownDigits from './CountdownDigits';
import { AddressLine } from './MapEmbed';
import MapEmbed from './MapEmbed';

export default function DashboardView({
  heroEvent, upcomingEvents, isAppLoading,
  expandedMapIds, onToggleMap,
  onTabChange, onShowExport
}) {
  const { isDark, c_cardBg, c_cardBorder, c_cardShadow, c_textSub, t_bg, t_text, t_border, lang, L } = useAppContext();

  if (isAppLoading) {
    return (
      <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <div className={`${c_cardBg} rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-dashed ${c_cardBorder} h-64`}>
          <Loader2 className={`w-10 h-10 ${t_text} mb-4 animate-spin`} />
          <p className={`${c_textSub} font-medium animate-pulse`}>{L.syncing}</p>
        </div>
      </motion.div>
    );
  }

  if (!heroEvent) {
    return (
      <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <div className={`${c_cardBg} rounded-3xl p-8 flex flex-col items-center text-center border border-dashed ${c_cardBorder}`}>
          <Clock className={`w-10 h-10 ${isDark ? 'text-slate-700' : 'text-slate-300'} mb-3`} />
          <p className={`${c_textSub} font-medium`}>{L.noEvents}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Hero Card */}
      <div className={`${c_cardBg} rounded-3xl p-8 ${c_cardShadow} border ${t_border} relative overflow-hidden mb-8 transition-colors duration-300`}>
        <div className={`absolute -top-20 -right-20 w-64 h-64 ${t_bg} rounded-full blur-3xl opacity-60 pointer-events-none`}></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <span className={`px-3 py-1 ${t_bg} ${t_text} rounded-full text-xs font-semibold tracking-wide uppercase mb-6 flex items-center gap-1.5`}><Star className="w-3.5 h-3.5" fill="currentColor" /> {L.pinnedEvent}</span>
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 leading-tight">{heroEvent.title}</h2>
          <p className={`${c_textSub} text-sm flex items-center gap-1.5 mb-1 flex-wrap justify-center`}>
            <CalendarDays className="w-4 h-4" /> {formatEventDateRange(heroEvent, lang)}
            {heroEvent.isRecurring && <span className={`inline-flex items-center gap-1 text-[0.625rem] font-semibold ${t_text} ${t_bg} px-2 py-0.5 rounded-full`}><Repeat className="w-3 h-3" /> {L.recurring}</span>}
          </p>
          {hasRealLocation(heroEvent.location) && <div className={`${c_textSub} text-sm mb-1 max-w-md`}><AddressLine location={formatLocationForLang(heroEvent.location, lang)} /></div>}
          <CountdownDigits targetDate={heroEvent.date} />
          <div className="w-full mt-6 flex flex-wrap items-center justify-center gap-2">
            {hasRealLocation(heroEvent.location) && (
              <button onClick={() => onToggleMap(heroEvent.id)} className={`inline-flex items-center gap-1.5 text-xs font-semibold ${t_text} ${t_bg} px-4 py-2 rounded-full transition-colors`}><MapPin className="w-3.5 h-3.5" />{expandedMapIds.has(heroEvent.id) ? L.hideMap : L.showMap}</button>
            )}
            <button onClick={onShowExport} className={`inline-flex items-center gap-1.5 text-xs font-semibold ${t_text} bg-transparent border ${t_border} px-4 py-2 rounded-full transition-colors hover:${t_bg}`}><ImageIcon className="w-3.5 h-3.5" />{L.exportImage}</button>
          </div>
          <MapEmbed location={heroEvent.location} eventId={heroEvent.id} isExpanded={expandedMapIds.has(heroEvent.id)} t_text={t_text} c_cardBorder={c_cardBorder} />
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-base font-semibold">{L.upcoming}</h3>
            <button onClick={() => onTabChange('timeline')} className={`text-xs font-medium ${t_text}`}>{L.viewAll}</button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className={`${c_cardBg} p-4 rounded-2xl border ${c_cardBorder} flex items-center gap-4 ${isDark ? 'shadow-none' : 'shadow-sm'}`}>
                <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} border flex flex-col items-center justify-center flex-shrink-0`}>
                  <span className={`text-[0.625rem] ${c_textSub} font-medium`}>{event.date.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short' })}</span>
                  <span className="text-sm font-bold leading-none">{event.date.getDate()}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-medium text-sm truncate">{event.title}</h4>
                  {isMultiDay(event) && <p className={`text-[0.625rem] ${c_textSub} truncate mt-0.5`}>{formatEventDateRange(event, lang)}</p>}
                  <p className={`text-[0.6875rem] ${c_textSub} truncate flex items-center gap-1 mt-1`}><MapPin className="w-3 h-3 flex-shrink-0" /> {formatLocationForLang(event.location, lang)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

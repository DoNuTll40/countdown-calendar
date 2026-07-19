// ============================================================
// components/TimelineView.jsx — All events timeline
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Star, RefreshCw, Loader2 } from 'lucide-react';
import Ripple from '@nuttawoot_donut/react-ripple';
import { useAppContext } from '../context/AppContext';
import { formatEventDateRange, formatLocationForLang } from '../utils';
import { AddressLine } from './MapEmbed';
import MapEmbed from './MapEmbed';
import EventDescription from './EventDescription';
import EventActionsBar from './EventActionsBar';

const ripple = new Ripple();

const TimelineView = React.memo(function TimelineView({
  events, heroEventId, isAppLoading, expandedMapIds,
  onToggleMap, onSetHero, onRefresh, onShare, copiedId,
}) {
  const { isDark, c_cardBg, c_cardBorder, c_cardShadow, c_textSub, c_textMain, t_bg, t_text, t_border, themeHex, lang, L } = useAppContext();

  return (
    <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">{L.allSchedules}</h2>
        <button onMouseDown={(e) => ripple.create(e)} onClick={onRefresh} className={`relative overflow-hidden w-10 h-10 rounded-full ${t_bg} ${t_text} flex items-center justify-center transition-colors`}>
          <RefreshCw className={`w-5 h-5 ${isAppLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="space-y-4">
        {isAppLoading ? (
          <div className={`text-center py-10 ${c_textSub} text-sm flex items-center justify-center gap-2`}><Loader2 className={`w-4 h-4 animate-spin ${t_text}`} /> {L.loading}</div>
        ) : events.map((event) => {
          const isHero = event.id === heroEventId;
          return (
            <div key={event.id} className={`group relative ${c_cardBg} rounded-3xl p-5 border ${isHero ? `${t_border} ${isDark ? '' : 'shadow-[0_4px_20px_rgba(0,0,0,0.06)]'}` : `${c_cardBorder} ${c_cardShadow}`} transition-all duration-300`}>
              <button onMouseDown={(e) => ripple.create(e)} onClick={() => onSetHero(event.id)} className={`absolute top-5 right-5 z-10 overflow-hidden p-2.5 rounded-xl border transition-colors ${isHero ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textSub}`}`}>
                <Star className="w-5 h-5" fill={isHero ? "currentColor" : "none"} />
              </button>
              <div className="flex gap-4 items-start">
                <div className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${isHero ? 'animate-pulse' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`} style={isHero ? { backgroundColor: themeHex } : {}}></div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-medium mb-1 leading-snug pr-14">{event.title}</h3>
                  <div className={`text-sm ${c_textSub} space-y-1`}>
                    <p className="flex items-center gap-1.5 flex-wrap"><CalendarDays className="w-4 h-4" /> {formatEventDateRange(event, lang)}</p>
                    <AddressLine location={formatLocationForLang(event.location, lang)} />
                    {event.description && <EventDescription event={event} />}
                    <EventActionsBar event={event} isMapExpanded={expandedMapIds.has(event.id)} onToggleMap={onToggleMap} onShare={onShare} isCopied={copiedId === event.id} t_text={t_text} t_bg={t_bg} />
                    <MapEmbed location={event.location} eventId={event.id} isExpanded={expandedMapIds.has(event.id)} t_text={t_text} c_cardBorder={c_cardBorder} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
});

export default TimelineView;

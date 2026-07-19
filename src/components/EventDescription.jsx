// ============================================================
// components/EventDescription.jsx — Description preview + modal
// ============================================================

import React, { useState, useMemo } from 'react';
import { CalendarDays, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cleanSpanArtifacts, buildMarkdownComponents, formatEventDateRange, hasRealLocation } from '../utils';
import { useAppContext } from '../context/AppContext';
import EventActionsBar from './EventActionsBar';
import MapEmbed from './MapEmbed';

// --- Description Bottom Sheet Modal ---
const DescriptionModal = React.memo(function DescriptionModal({
  open, event, onClose,
  showActions, isMapExpanded, onToggleMap, onShare, isCopied
}) {
  const { isDark, c_cardBg, c_cardBorder, c_textSub, c_textMain, t_text, t_bg } = useAppContext();
  const dragControls = useDragControls();
  const components = useMemo(() => buildMarkdownComponents(t_text, false), [t_text]);
  const cleaned = useMemo(() => (event ? cleanSpanArtifacts(event.description) : ''), [event]);

  return (
    <AnimatePresence>
      {open && event && (
        <>
          <motion.div
            key="description-backdrop"
            className="fixed inset-0 bg-black/50 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="description-sheet"
            className={`fixed inset-x-0 bottom-0 z-[61] ${c_cardBg} rounded-t-[2rem] border-t ${c_cardBorder} max-h-[85vh] flex flex-col`}
            style={{ transform: 'translateZ(0)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 600) onClose();
            }}
          >
            <div
              className="flex justify-center pt-3 pb-2 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className={`w-10 h-1.5 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
            </div>
            <div className={`flex items-start justify-between gap-3 px-6 pb-4 border-b ${c_cardBorder} flex-shrink-0`}>
              <div className="min-w-0">
                <h3 className={`text-lg font-semibold ${c_textMain} leading-snug`}>{event.title}</h3>
                <p className={`text-xs ${c_textSub} mt-1.5 flex items-center gap-1.5 flex-wrap`}>
                  <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" /> {formatEventDateRange(event)}
                </p>
                {hasRealLocation(event.location) && (
                  <p className={`text-xs ${c_textSub} mt-1 flex items-start gap-1.5`}>
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {event.location}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className={`flex-shrink-0 w-9 h-9 rounded-full ${t_bg} ${t_text} flex items-center justify-center`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={`px-6 py-5 overflow-y-auto text-sm ${c_textSub}`}>
              {showActions && (
                <div className={`mb-4 pb-4 border-b ${c_cardBorder}`}>
                  <EventActionsBar event={event} isMapExpanded={isMapExpanded} onToggleMap={onToggleMap} onShare={onShare} isCopied={isCopied} t_text={t_text} t_bg={t_bg} />
                  <MapEmbed location={event.location} eventId={event.id} isExpanded={isMapExpanded} t_text={t_text} c_cardBorder={c_cardBorder} />
                </div>
              )}
              {cleaned ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{cleaned}</ReactMarkdown> : <p className={c_textSub}>ไม่มีรายละเอียดเพิ่มเติม</p>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// --- Inline Description Preview ---
const EventDescription = React.memo(function EventDescription({ event }) {
  const { isDark, c_cardBg, c_cardBorder, c_textSub, c_textMain, t_text, t_bg } = useAppContext();
  const [open, setOpen] = useState(false);
  const cleaned = useMemo(() => cleanSpanArtifacts(event.description), [event.description]);
  const previewComponents = useMemo(() => buildMarkdownComponents(t_text, true), [t_text]);

  if (!cleaned) return null;

  return (
    <>
      <div className={`text-xs ${c_textSub} mt-1.5`}>
        <div className="line-clamp-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={previewComponents}>{cleaned}</ReactMarkdown>
        </div>
        <button onClick={() => setOpen(true)} className={`text-[0.6875rem] font-semibold ${t_text} mt-1`}>ดูเพิ่มเติม</button>
      </div>
      <DescriptionModal open={open} event={event} onClose={() => setOpen(false)} />
    </>
  );
});

export { DescriptionModal };
export default EventDescription;

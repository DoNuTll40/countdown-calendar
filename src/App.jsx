import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  CalendarDays, Settings, Home, MapPin, Star,
  RefreshCw, CheckCircle2, Clock, Loader2,
  Palette, Type, MonitorSmartphone, Moon, Sun, Scaling, Map, ChevronDown, ListFilter,
  Share2, Check, Video, Repeat, X, Info
} from 'lucide-react';
import Ripple from '@nuttawoot_donut/react-ripple';
import { neon } from '@neondatabase/serverless'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ripple = new Ripple();

const THEMES = {
  blue: { bgLight: 'bg-blue-50', bgDark: 'bg-blue-500/20', textLight: 'text-blue-600', textDark: 'text-blue-400', borderLight: 'border-blue-200', borderDark: 'border-blue-500/30', hex: '#2563eb' },
  emerald: { bgLight: 'bg-emerald-50', bgDark: 'bg-emerald-500/20', textLight: 'text-emerald-600', textDark: 'text-emerald-400', borderLight: 'border-emerald-200', borderDark: 'border-emerald-500/30', hex: '#10b981' },
  violet: { bgLight: 'bg-violet-50', bgDark: 'bg-violet-500/20', textLight: 'text-violet-600', textDark: 'text-violet-400', borderLight: 'border-violet-200', borderDark: 'border-violet-500/30', hex: '#8b5cf6' },
  rose: { bgLight: 'bg-rose-50', bgDark: 'bg-rose-500/20', textLight: 'text-rose-600', textDark: 'text-rose-400', borderLight: 'border-rose-200', borderDark: 'border-rose-500/30', hex: '#e11d48' }
};

const FONT_SIZE_PX = { sm: 14, base: 16, lg: 19 };
const VALID_TABS = ['dashboard', 'timeline', 'settings'];
const UPCOMING_COUNT_OPTIONS = [3, 5, 10];

const injectSystemSettings = () => {
  if (!document.getElementById('app-fonts')) {
    const style = document.createElement('style');
    style.id = 'app-fonts';
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');
      @font-face {
        font-family: 'Google Sans';
        src: local('Google Sans'), url('https://fonts.gstatic.com/s/productsans/v5/HYvgU2fE2nRJvZ5JFAumwegdm0LZdjqr5-oayXSOefg.woff2') format('woff2');
      }
      html { transition: font-size 0.2s ease; }
      body { touch-action: pan-y; overflow-x: hidden; transition: background-color 0.3s ease; margin: 0; }
      .font-google { font-family: 'Google Sans', 'Noto Sans Thai', sans-serif; }
    `;
    document.head.appendChild(style);
  }
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = "viewport";
    document.head.appendChild(meta);
  }
  meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
};

const ENV = {
  GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',
  CALENDAR_ID: import.meta.env.VITE_CALENDAR_ID || '',
  NEON_DB_STRING: import.meta.env.VITE_NEON_DB_STRING || ''
};

const getInitialTab = () => {
  const fromHash = window.location.hash.replace('#', '');
  if (VALID_TABS.includes(fromHash)) return fromHash;
  const fromStorage = localStorage.getItem('last_tab');
  if (VALID_TABS.includes(fromStorage)) return fromStorage;
  return 'dashboard';
};

const hasRealLocation = (location) => !!location && location !== 'ไม่ระบุสถานที่';
const getMapEmbedUrl = (location) => `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
const getMapsExternalUrl = (location) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
const formatThaiDate = (date) => date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
const isMultiDay = (event) => event.endDate && event.date.toDateString() !== event.endDate.toDateString();
const formatEventDateRange = (event) => isMultiDay(event) ? `${formatThaiDate(event.date)} - ${formatThaiDate(event.endDate)}` : formatThaiDate(event.date);

const stripHtml = (html) => html
  ? html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  : '';

const cleanSpanArtifacts = (text) => text
  ? text.replace(/\[span_\d+\]\((?:start_span|end_span)\)/g, '')
  : '';

const buildMarkdownComponents = (t_text, compact = true) => ({
  h1: ({ node, ...props }) => <p className={`font-semibold ${compact ? 'text-sm' : 'text-base'} mt-1.5 first:mt-0`} {...props} />,
  h2: ({ node, ...props }) => <p className={`font-semibold ${compact ? 'text-sm' : 'text-base'} mt-1.5 first:mt-0`} {...props} />,
  h3: ({ node, ...props }) => <p className={`font-semibold ${compact ? 'text-xs' : 'text-sm'} mt-1.5 first:mt-0`} {...props} />,
  p: ({ node, ...props }) => <p className="mt-1 first:mt-0 leading-relaxed" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-0.5 mt-1" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-0.5 mt-1" {...props} />,
  li: ({ node, ...props }) => <li {...props} />,
  hr: () => <hr className="my-2 border-current opacity-20" />,
  a: ({ node, ...props }) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={`underline underline-offset-2 break-all ${t_text}`}
      {...props}
    />
  ),
});

const DescriptionModal = React.memo(function DescriptionModal({
  open, event, onClose, isDark, c_cardBg, c_cardBorder, c_textSub, c_textMain, t_text, t_bg,
  showActions, isMapExpanded, onToggleMap, onShare, isCopied
}) {
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
                  <EventActionsBar
                    event={event}
                    isMapExpanded={isMapExpanded}
                    onToggleMap={onToggleMap}
                    onShare={onShare}
                    isCopied={isCopied}
                    t_text={t_text}
                    t_bg={t_bg}
                  />
                  <MapEmbed
                    location={event.location}
                    eventId={event.id}
                    isExpanded={isMapExpanded}
                    t_text={t_text}
                    c_cardBorder={c_cardBorder}
                  />
                </div>
              )}
              {cleaned ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                  {cleaned}
                </ReactMarkdown>
              ) : (
                <p className={c_textSub}>ไม่มีรายละเอียดเพิ่มเติม</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

const buildShareText = (event) => {
  let text = `${event.title}\n${formatEventDateRange(event)}`;
  if (hasRealLocation(event.location)) text += `\n${event.location}`;
  return text;
};

const computeCountdown = (targetDate, now) => {
  const diff = targetDate - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
};

const FlipUnit = React.memo(function FlipUnit({ value, label, isDark, c_textMain, c_textSub, index }) {
  const display = value.toString().padStart(2, '0');
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`${isDark ? 'bg-slate-700 border-slate-600 shadow-none' : 'bg-white border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'} rounded-[20px] p-4 min-w-[4.5rem] h-[4.5rem] flex items-center justify-center mb-2 relative overflow-hidden transition-transform hover:scale-105`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={display}
            initial={{ y: 24, opacity: 0, filter: 'blur(2px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -24, opacity: 0, filter: 'blur(2px)' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className={`text-4xl font-medium tracking-tight ${c_textMain} tabular-nums absolute`}
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className={`text-[0.6875rem] font-semibold ${c_textSub} uppercase tracking-widest`}>{label}</span>
    </motion.div>
  );
});

const Colon = ({ isDark }) => (
  <motion.div
    className={`text-3xl font-light ${isDark ? 'text-slate-600' : 'text-slate-300'} mt-3 hidden sm:block`}
    animate={{ opacity: [1, 0.25, 1] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  >
    :
  </motion.div>
);

const CountdownDigits = React.memo(function CountdownDigits({ targetDate, isDark, c_textMain, c_textSub }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const cd = computeCountdown(targetDate, now);

  return (
    <div className="flex justify-center gap-3 md:gap-5 mt-4">
      <FlipUnit value={cd.days} label="Days" isDark={isDark} c_textMain={c_textMain} c_textSub={c_textSub} index={0} />
      <Colon isDark={isDark} />
      <FlipUnit value={cd.hours} label="Hours" isDark={isDark} c_textMain={c_textMain} c_textSub={c_textSub} index={1} />
      <Colon isDark={isDark} />
      <FlipUnit value={cd.minutes} label="Mins" isDark={isDark} c_textMain={c_textMain} c_textSub={c_textSub} index={2} />
      <Colon isDark={isDark} />
      <FlipUnit value={cd.seconds} label="Secs" isDark={isDark} c_textMain={c_textMain} c_textSub={c_textSub} index={3} />
    </div>
  );
});

const AddressLine = React.memo(function AddressLine({ location }) {
  return (
    <div className="flex items-start gap-1.5">
      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span className="flex-grow">{location}</span>
    </div>
  );
});

const MapEmbed = React.memo(function MapEmbed({ location, eventId, isExpanded, t_text, c_cardBorder }) {
  if (!hasRealLocation(location)) return null;
  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className={`mt-3 rounded-2xl overflow-hidden border ${c_cardBorder}`} style={{ transform: 'translateZ(0)', isolation: 'isolate' }}>
            <iframe
              title={`map-${eventId}`}
              src={getMapEmbedUrl(location)}
              width="100%"
              height="200"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-2 flex justify-end">
            <a
              href={getMapsExternalUrl(location)}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[0.6875rem] font-semibold ${t_text} underline underline-offset-2`}
            >
              เปิดใน Google Maps
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

const EventDescription = React.memo(function EventDescription({
  event, c_textSub, t_text, t_bg, isDark, c_cardBg, c_cardBorder, c_textMain
}) {
  const [open, setOpen] = useState(false);
  const cleaned = useMemo(() => cleanSpanArtifacts(event.description), [event.description]);
  const previewComponents = useMemo(() => buildMarkdownComponents(t_text, true), [t_text]);
  if (!cleaned) return null;
  return (
    <>
      <div className={`text-xs ${c_textSub} mt-1.5`}>
        {/* เอา pr-2 ออกจากตรงนี้ เพราะไม่จำเป็นแล้ว */}
        <div className="line-clamp-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={previewComponents}>
            {cleaned}
          </ReactMarkdown>
        </div>
        <button
          onClick={() => setOpen(true)}
          className={`text-[0.6875rem] font-semibold ${t_text} mt-1`}
        >
          ดูเพิ่มเติม
        </button>
      </div>
      <DescriptionModal
        open={open}
        event={event}
        onClose={() => setOpen(false)}
        isDark={isDark}
        c_cardBg={c_cardBg}
        c_cardBorder={c_cardBorder}
        c_textSub={c_textSub}
        c_textMain={c_textMain}
        t_text={t_text}
        t_bg={t_bg}
      />
    </>
  );
});

const EventActionsBar = React.memo(function EventActionsBar({ event, isMapExpanded, onToggleMap, onShare, isCopied, t_text, t_bg }) {
  const pillClass = `inline-flex items-center gap-1.5 text-xs font-semibold ${t_text} ${t_bg} px-3 py-1.5 rounded-full transition-colors`;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {hasRealLocation(event.location) && (
        <button onClick={() => onToggleMap(event.id)} className={pillClass}>
          <Map className="w-3.5 h-3.5" />
          {isMapExpanded ? 'ซ่อนแผนที่' : 'ดูแผนที่'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMapExpanded ? 'rotate-180' : ''}`} />
        </button>
      )}
      <button onClick={() => onShare(event)} className={pillClass}>
        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        {isCopied ? 'คัดลอกลิงก์แล้ว' : 'แชร์'}
      </button>
      {event.meetLink && (
        <a href={event.meetLink} target="_blank" rel="noopener noreferrer" className={pillClass}>
          <Video className="w-3.5 h-3.5" /> เข้าร่วม Meet
        </a>
      )}
      {event.htmlLink && (
        <a
          href={event.htmlLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs font-semibold ${t_text} underline underline-offset-2`}
        >
          เปิดใน Google Calendar
        </a>
      )}
    </div>
  );
});

const TimelineView = React.memo(function TimelineView({
  events, heroEventId, isAppLoading, expandedMapIds, onToggleMap, onSetHero, onRefresh, onShare, copiedId,
  isDark, t_bg, t_text, t_border, c_cardBg, c_cardBorder, c_cardShadow, c_textSub, c_textMain, themeHex
}) {
  return (
    <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">กำหนดการทั้งหมด</h2>
        <button
          onMouseDown={(e) => ripple.create(e)}
          onClick={onRefresh}
          className={`relative overflow-hidden w-10 h-10 rounded-full ${t_bg} ${t_text} flex items-center justify-center transition-colors`}
        >
          <RefreshCw className={`w-5 h-5 ${isAppLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {isAppLoading ? (
          <div className={`text-center py-10 ${c_textSub} text-sm flex items-center justify-center gap-2`}>
            <Loader2 className={`w-4 h-4 animate-spin ${t_text}`} /> กำลังโหลดรายการ...
          </div>
        ) : events.map((event) => {
          const isHero = event.id === heroEventId;
          return (
            <div key={event.id} className={`group relative ${c_cardBg} rounded-3xl p-5 border ${isHero ? `${t_border} ${isDark ? '' : 'shadow-[0_4px_20px_rgba(0,0,0,0.06)]'}` : `${c_cardBorder} ${c_cardShadow}`} transition-all duration-300`}>
              
              {/* ปรับให้ขอบของปุ่มดาวขนานกับ Padding p-5 (20px) ของ Card พอดี */}
              <button
                onMouseDown={(e) => ripple.create(e)}
                onClick={() => onSetHero(event.id)}
                className={`absolute top-5 right-5 z-10 overflow-hidden p-2.5 rounded-xl border transition-colors ${isHero ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textSub}`}`}
              >
                <Star className="w-5 h-5" fill={isHero ? "currentColor" : "none"} />
              </button>

              <div className="flex gap-4 items-start">
                <div className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${isHero ? 'animate-pulse' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`} style={isHero ? { backgroundColor: themeHex } : {}}></div>
                
                {/* เอา pr-12 ออกจาก wrapper หลัก เพื่อให้เนื้อหาส่วนใหญ่กางเต็มความกว้าง */}
                <div className="flex-grow min-w-0">
                  {/* ย้ายระยะห่าง (pr-14) มาใส่ที่ชื่อแทน เพื่อหลบปุ่มดาวเฉพาะตรงนี้ */}
                  <h3 className="text-lg font-medium mb-1 leading-snug pr-14">{event.title}</h3>
                  <div className={`text-sm ${c_textSub} space-y-1`}>
                    <p className="flex items-center gap-1.5 flex-wrap">
                      <CalendarDays className="w-4 h-4" /> {formatEventDateRange(event)}
                      {event.isRecurring && (
                        <span className={`inline-flex items-center gap-1 text-[0.625rem] font-semibold ${t_text} ${t_bg} px-2 py-0.5 rounded-full`}>
                          <Repeat className="w-3 h-3" /> ประจำ
                        </span>
                      )}
                    </p>
                    <AddressLine location={event.location} />
                    {event.description && (
                      <EventDescription
                        event={event}
                        c_textSub={c_textSub}
                        t_text={t_text}
                        t_bg={t_bg}
                        isDark={isDark}
                        c_cardBg={c_cardBg}
                        c_cardBorder={c_cardBorder}
                        c_textMain={c_textMain}
                      />
                    )}
                    <EventActionsBar
                      event={event}
                      isMapExpanded={expandedMapIds.has(event.id)}
                      onToggleMap={onToggleMap}
                      onShare={onShare}
                      isCopied={copiedId === event.id}
                      t_text={t_text}
                      t_bg={t_bg}
                    />
                    <MapEmbed
                      location={event.location}
                      eventId={event.id}
                      isExpanded={expandedMapIds.has(event.id)}
                      t_text={t_text}
                      c_cardBorder={c_cardBorder}
                    />
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

export default function App() {
  const [activeTab, setActiveTabState] = useState(getInitialTab);

  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('app_preferences');
    const parsed = saved ? JSON.parse(saved) : {};
    return { theme: 'blue', fontSize: 'base', darkMode: false, navSize: 'md', upcomingCount: 3, ...parsed };
  });

  const [events, setEvents] = useState([]);
  const [dbHeroId, setDbHeroId] = useState(null);
  const [dbStatus, setDbStatus] = useState('offline');
  const [isNeonLoading, setIsNeonLoading] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(true);

  const [expandedMapIds, setExpandedMapIds] = useState(() => new Set());
  const toggleMap = useCallback((id) => {
    setExpandedMapIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const [copiedId, setCopiedId] = useState(null);
  const handleShare = useCallback(async (event) => {
    const text = buildShareText(event);
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, text, url: event.htmlLink || undefined });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(event.htmlLink ? `${text}\n${event.htmlLink}` : text);
        setCopiedId(event.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      // User cancelled share
    }
  }, []);

  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    window.location.hash = tab;
    localStorage.setItem('last_tab', tab);
  }, []);

  useEffect(() => {
    injectSystemSettings();
    const preventDoubleTapZoom = (e) => { if (e.touches.length > 1) e.preventDefault(); };
    document.addEventListener('touchstart', preventDoubleTapZoom, { passive: false });

    const handleHashChange = () => {
      const tab = window.location.hash.replace('#', '');
      if (VALID_TABS.includes(tab)) {
        setActiveTabState(tab);
        localStorage.setItem('last_tab', tab);
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    if (!window.location.hash) {
      window.location.hash = getInitialTab();
    }

    return () => {
      document.removeEventListener('touchstart', preventDoubleTapZoom);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = prefs.darkMode ? '#0f172a' : '#fafafa';
  }, [prefs.darkMode]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${FONT_SIZE_PX[prefs.fontSize] || FONT_SIZE_PX.base}px`;
  }, [prefs.fontSize]);

  const handleSavePrefs = useCallback((newPrefs) => {
    setPrefs(newPrefs);
    localStorage.setItem('app_preferences', JSON.stringify(newPrefs));
  }, []);

  const fetchNeonHero = useCallback(async () => {
    setIsNeonLoading(true);
    if (!ENV.NEON_DB_STRING) { setIsNeonLoading(false); return; }
    try {
      setDbStatus('connecting');
      const sql = neon(ENV.NEON_DB_STRING);
      const result = await sql`SELECT hero_id FROM countdown_settings WHERE id = 1 LIMIT 1`;
      if (result.length > 0) {
        setDbHeroId(result[0].hero_id);
        setDbStatus('online');
      } else {
        setDbStatus('offline');
      }
    } catch (error) {
      setDbStatus('offline');
    }
    setIsNeonLoading(false);
  }, []);

  const fetchGoogleEvents = useCallback(async () => {
    setIsGoogleLoading(true);
    if (!ENV.GOOGLE_API_KEY || !ENV.CALENDAR_ID) { setIsGoogleLoading(false); return; }
    const calendarIdEncoded = encodeURIComponent(ENV.CALENDAR_ID);
    try {
      const now = new Date().toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarIdEncoded}/events?key=${ENV.GOOGLE_API_KEY}&timeMin=${now}&singleEvents=true&orderBy=startTime&maxResults=15`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (data.items && data.items.length > 0) {
        const formattedEvents = data.items.map(item => {
          const isAllDay = !item.start.dateTime;
          const startDate = new Date(item.start.dateTime || item.start.date);
          let endDate = new Date(item.end.dateTime || item.end.date);
          if (isAllDay) endDate = new Date(endDate.getTime() - 86400000);
          const meetLink = item.hangoutLink || item.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri || null;
          return {
            id: item.id,
            title: item.summary,
            date: startDate,
            endDate,
            location: item.location || 'ไม่ระบุสถานที่',
            description: stripHtml(item.description),
            htmlLink: item.htmlLink || null,
            meetLink,
            isRecurring: !!item.recurringEventId,
            type: 'google'
          };
        });
        setEvents(formattedEvents);
      }
    } catch (error) { /* silent fail */ }
    setIsGoogleLoading(false);
  }, []);

  const refreshAll = useCallback(() => { fetchGoogleEvents(); fetchNeonHero(); }, [fetchGoogleEvents, fetchNeonHero]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const handleSetHero = useCallback(async (id) => {
    setDbHeroId(id);
    if (ENV.NEON_DB_STRING) {
      try {
        const sql = neon(ENV.NEON_DB_STRING);
        await sql`UPDATE countdown_settings SET hero_id = ${id} WHERE id = 1`;
      } catch (err) { /* silent fail */ }
    }
  }, []);

  const isAppLoading = isNeonLoading || isGoogleLoading;

  const heroEvent = useMemo(() => {
    if (events.length === 0) return null;
    if (dbHeroId) {
      const found = events.find(e => e.id === dbHeroId);
      if (found) return found;
    }
    return events[0];
  }, [events, dbHeroId]);

  const upcomingEvents = useMemo(() => {
    if (events.length === 0) return [];
    return events.filter(e => e.id !== heroEvent?.id).slice(0, prefs.upcomingCount);
  }, [events, heroEvent, prefs.upcomingCount]);

  const isDark = prefs.darkMode;
  const c_bgMain = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const c_textMain = isDark ? 'text-slate-100' : 'text-slate-900';
  const c_textSub = isDark ? 'text-slate-400' : 'text-slate-500';
  const c_cardBg = isDark ? 'bg-slate-800' : 'bg-white';
  const c_cardBorder = isDark ? 'border-slate-700' : 'border-slate-200';
  const c_cardShadow = isDark ? 'shadow-none' : 'shadow-sm';

  const c_headerBg = isDark ? 'bg-slate-900/80' : 'bg-white/70';
  const c_navBg = isDark ? 'bg-slate-800/90' : 'bg-white/90';

  const t_bg = isDark ? THEMES[prefs.theme].bgDark : THEMES[prefs.theme].bgLight;
  const t_text = isDark ? THEMES[prefs.theme].textDark : THEMES[prefs.theme].textLight;
  const t_border = isDark ? THEMES[prefs.theme].borderDark : THEMES[prefs.theme].borderLight;

  const getNavSizeClasses = () => {
    if (prefs.navSize === 'sm') return { container: 'max-w-[16.25rem] p-1.5', icon: 'w-[1.125rem] h-[1.125rem]', text: 'text-[0.5625rem] mt-0.5' };
    if (prefs.navSize === 'lg') return { container: 'max-w-[22.5rem] p-2.5', icon: 'w-[1.625rem] h-[1.625rem]', text: 'text-[0.75rem] mt-1' };
    return { container: 'max-w-[20rem] p-2', icon: 'w-[1.375rem] h-[1.375rem]', text: 'text-[0.625rem] mt-1' };
  };
  const navStyles = getNavSizeClasses();

  return (
    <div className={`font-google min-h-screen ${c_bgMain} ${c_textMain} pb-36 selection:${t_bg} transition-colors duration-300`}>

      <header
        className={`sticky top-0 z-40 ${c_headerBg} backdrop-blur-xl border-b ${c_cardBorder} px-5 py-4 transition-colors duration-300`}
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            Countdown<span className={t_text}>.</span>
          </h1>
          <div className={`flex items-center gap-2 text-xs font-medium ${c_cardBg} px-3 py-1.5 rounded-full shadow-sm border ${c_cardBorder}`}>
            <span className={`w-2 h-2 rounded-full ${dbStatus === 'online' ? `bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]` : 'bg-slate-400'}`}></span>
            <span className={c_textSub}>{dbStatus === 'online' ? 'Neon Sync' : 'Local Mode'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">

          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

              {isAppLoading ? (
                <div className={`${c_cardBg} rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-dashed ${c_cardBorder} h-64`}>
                  <Loader2 className={`w-10 h-10 ${t_text} mb-4 animate-spin`} />
                  <p className={`${c_textSub} font-medium animate-pulse`}>กำลังซิงค์ข้อมูล...</p>
                </div>
              ) : heroEvent ? (
                <>
                  <div className={`${c_cardBg} rounded-3xl p-8 ${c_cardShadow} border ${t_border} relative overflow-hidden mb-8 transition-colors duration-300`}>
                    <div className={`absolute -top-20 -right-20 w-64 h-64 ${t_bg} rounded-full blur-3xl opacity-60 pointer-events-none`}></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <span className={`px-3 py-1 ${t_bg} ${t_text} rounded-full text-xs font-semibold tracking-wide uppercase mb-6 flex items-center gap-1.5`}>
                        <Star className="w-3.5 h-3.5" fill="currentColor" /> Pinned Event
                      </span>
                      <h2 className="text-2xl md:text-3xl font-semibold mb-2 leading-tight">
                        {heroEvent.title}
                      </h2>
                      <p className={`${c_textSub} text-sm flex items-center gap-1.5 mb-1 flex-wrap justify-center`}>
                        <CalendarDays className="w-4 h-4" /> {formatEventDateRange(heroEvent)}
                        {heroEvent.isRecurring && (
                          <span className={`inline-flex items-center gap-1 text-[0.625rem] font-semibold ${t_text} ${t_bg} px-2 py-0.5 rounded-full`}>
                            <Repeat className="w-3 h-3" /> ประจำ
                          </span>
                        )}
                      </p>
                      {hasRealLocation(heroEvent.location) && (
                        <div className={`${c_textSub} text-sm mb-1 max-w-md`}>
                          <AddressLine location={heroEvent.location} />
                        </div>
                      )}

                      <CountdownDigits
                        targetDate={heroEvent.date}
                        isDark={isDark}
                        c_textMain={c_textMain}
                        c_textSub={c_textSub}
                      />

                      {hasRealLocation(heroEvent.location) && (
                        <>
                          <button
                            onClick={() => toggleMap(heroEvent.id)}
                            className={`mt-6 inline-flex items-center gap-1.5 text-xs font-semibold ${t_text} ${t_bg} px-4 py-2 rounded-full transition-colors`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            {expandedMapIds.has(heroEvent.id) ? 'ซ่อนแผนที่' : 'ดูแผนที่'}
                          </button>

                          <MapEmbed
                            location={heroEvent.location}
                            eventId={heroEvent.id}
                            isExpanded={expandedMapIds.has(heroEvent.id)}
                            t_text={t_text}
                            c_cardBorder={c_cardBorder}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {upcomingEvents.length > 0 && (
                    <div className="mt-10">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-base font-semibold">กำลังจะมาถึง</h3>
                        <button onClick={() => setActiveTab('timeline')} className={`text-xs font-medium ${t_text}`}>ดูทั้งหมด</button>
                      </div>
                      <div className="space-y-3">
                        {upcomingEvents.map(event => (
                          <div key={event.id} className={`${c_cardBg} p-4 rounded-2xl border ${c_cardBorder} flex items-center gap-4 ${isDark ? 'shadow-none' : 'shadow-sm'}`}>
                            <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} border flex flex-col items-center justify-center flex-shrink-0`}>
                              <span className={`text-[0.625rem] ${c_textSub} font-medium`}>{event.date.toLocaleDateString('th-TH', { month: 'short' })}</span>
                              <span className="text-sm font-bold leading-none">{event.date.getDate()}</span>
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="font-medium text-sm truncate">{event.title}</h4>
                              {isMultiDay(event) && (
                                <p className={`text-[0.625rem] ${c_textSub} truncate mt-0.5`}>{formatEventDateRange(event)}</p>
                              )}
                              <p className={`text-[0.6875rem] ${c_textSub} truncate flex items-center gap-1 mt-1`}>
                                <MapPin className="w-3 h-3 flex-shrink-0" /> {event.location}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={`${c_cardBg} rounded-3xl p-8 flex flex-col items-center text-center border border-dashed ${c_cardBorder}`}>
                  <Clock className={`w-10 h-10 ${isDark ? 'text-slate-700' : 'text-slate-300'} mb-3`} />
                  <p className={`${c_textSub} font-medium`}>ยังไม่มีกิจกรรม</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              events={events}
              heroEventId={heroEvent?.id}
              isAppLoading={isAppLoading}
              expandedMapIds={expandedMapIds}
              onToggleMap={toggleMap}
              onSetHero={handleSetHero}
              onRefresh={refreshAll}
              onShare={handleShare}
              copiedId={copiedId}
              isDark={isDark}
              t_bg={t_bg}
              t_text={t_text}
              t_border={t_border}
              c_cardBg={c_cardBg}
              c_cardBorder={c_cardBorder}
              c_cardShadow={c_cardShadow}
              c_textSub={c_textSub}
              c_textMain={c_textMain}
              themeHex={THEMES[prefs.theme].hex}
            />
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-2xl font-semibold mb-6">ตั้งค่าแอปพลิเคชัน</h2>

              <div className="space-y-6">

                <div className={`${c_cardBg} rounded-3xl p-6 border ${c_cardBorder} ${c_cardShadow} transition-colors duration-300`}>

                  <div className={`flex items-center justify-between mb-6 pb-6 border-b ${c_cardBorder}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${prefs.darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-50 text-amber-500'} flex items-center justify-center`}>
                        {prefs.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium">โหมดกลางคืน</h3>
                        <p className={`text-[0.625rem] ${c_textSub}`}>ถนอมสายตาในที่มืด</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSavePrefs({ ...prefs, darkMode: !prefs.darkMode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                      style={prefs.darkMode ? { backgroundColor: THEMES[prefs.theme].hex } : {}}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${t_bg} ${t_text} flex items-center justify-center`}>
                      <Palette className="w-5 h-5" />
                    </div>
                    <div><h3 className="font-medium">ธีมสีหลัก (Theme Color)</h3></div>
                  </div>
                  <div className="flex gap-4">
                    {Object.keys(THEMES).map((themeKey) => (
                      <button
                        key={themeKey}
                        onClick={() => handleSavePrefs({ ...prefs, theme: themeKey })}
                        className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${prefs.theme === themeKey ? (isDark ? 'border-white scale-110 shadow-md' : 'border-slate-800 scale-110 shadow-md') : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: THEMES[themeKey].hex }}
                      >
                        {prefs.theme === themeKey && <CheckCircle2 className="w-5 h-5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`${c_cardBg} rounded-3xl p-6 border ${c_cardBorder} ${c_cardShadow} transition-colors duration-300`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} flex items-center justify-center`}>
                      <Type className="w-5 h-5" />
                    </div>
                    <div><h3 className="font-medium">ขนาดตัวอักษร</h3></div>
                  </div>
                  <div className={`grid grid-cols-3 gap-3 mb-6 pb-6 border-b ${c_cardBorder}`}>
                    <button onClick={() => handleSavePrefs({ ...prefs, fontSize: 'sm' })} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${prefs.fontSize === 'sm' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>เล็ก</button>
                    <button onClick={() => handleSavePrefs({ ...prefs, fontSize: 'base' })} className={`py-2.5 rounded-xl border text-base font-medium transition-colors ${prefs.fontSize === 'base' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>ปกติ</button>
                    <button onClick={() => handleSavePrefs({ ...prefs, fontSize: 'lg' })} className={`py-2.5 rounded-xl border text-lg font-medium transition-colors ${prefs.fontSize === 'lg' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>ใหญ่</button>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} flex items-center justify-center`}>
                      <Scaling className="w-5 h-5" />
                    </div>
                    <div><h3 className="font-medium">ขนาดแถบเมนู (Bottom Nav)</h3></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => handleSavePrefs({ ...prefs, navSize: 'sm' })} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${prefs.navSize === 'sm' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>เล็ก</button>
                    <button onClick={() => handleSavePrefs({ ...prefs, navSize: 'md' })} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${prefs.navSize === 'md' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>ปกติ</button>
                    <button onClick={() => handleSavePrefs({ ...prefs, navSize: 'lg' })} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${prefs.navSize === 'lg' ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}>ใหญ่</button>
                  </div>
                </div>

                <div className={`${c_cardBg} rounded-3xl p-6 border ${c_cardBorder} ${c_cardShadow} transition-colors duration-300`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} flex items-center justify-center`}>
                      <ListFilter className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">จำนวนรายการ "กำลังจะมาถึง"</h3>
                      <p className={`text-[0.625rem] ${c_textSub}`}>แสดงในหน้าแรกใต้ตัวนับถอยหลัง</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {UPCOMING_COUNT_OPTIONS.map(n => (
                      <button
                        key={n}
                        onClick={() => handleSavePrefs({ ...prefs, upcomingCount: n })}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${prefs.upcomingCount === n ? `${t_bg} ${t_border} ${t_text}` : `${c_cardBg} ${c_cardBorder} ${c_textMain}`}`}
                      >
                        {n} รายการ
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`${c_cardBg} rounded-3xl p-6 border ${c_cardBorder} ${c_cardShadow} opacity-70`}>
                  <div className="flex items-center gap-3 mb-2">
                    <MonitorSmartphone className={`w-5 h-5 ${c_textSub}`} />
                    <h3 className="font-medium">Environment Variables</h3>
                  </div>
                  <ul className={`text-[0.625rem] font-mono ${c_textSub} space-y-1`}>
                    <li>✓ VITE_GOOGLE_API_KEY: {ENV.GOOGLE_API_KEY ? 'Loaded' : 'Missing'}</li>
                    <li>✓ VITE_CALENDAR_ID: {ENV.CALENDAR_ID ? 'Loaded' : 'Missing'}</li>
                    <li>✓ VITE_NEON_DB_STRING: {ENV.NEON_DB_STRING ? 'Loaded' : 'Missing'}</li>
                  </ul>
                </div>
              </div>

              {/* --- Footer หน้าตั้งค่า --- */}
              <div className="mt-14 pb-0 flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 rounded-2xl ${t_bg} ${t_text} flex items-center justify-center mb-3 shadow-sm`}>
                  <CalendarDays className="w-6 h-6" />
                </div>
                
                <h3 className="font-semibold tracking-tight text-base mb-1 flex items-center justify-center gap-1">
                  Countdown<span className={t_text}>.</span>
                </h3>
                <p className={`text-xs ${c_textSub} mb-5`}>Version 1.0.0</p>
                
                <div className={`text-[0.625rem] ${c_textSub} space-y-1.5`}>
                  <p>Crafted by CS64'125 Nuttawoot Chawna</p>
                  <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none px-4 transition-all duration-300">
        <nav className={`pointer-events-auto ${c_navBg} backdrop-blur-2xl border ${isDark ? 'border-slate-700/60 shadow-[0_8px_30px_rgba(0,0,0,0.4)]' : 'border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)]'} rounded-[2rem] flex items-center justify-between w-full transition-all duration-300 ${navStyles.container}`}>

          <button
            onMouseDown={(e) => ripple.create(e)}
            onClick={() => setActiveTab('dashboard')}
            className={`relative overflow-hidden flex flex-col items-center justify-center w-1/3 py-2 rounded-[1.5rem] transition-all duration-300 ${activeTab === 'dashboard' ? `${t_bg} ${t_text}` : `${c_textSub} ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}`}
          >
            <Home className={`${navStyles.icon}`} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className={`font-semibold tracking-wide ${navStyles.text}`}>หน้าแรก</span>
          </button>

          <button
            onMouseDown={(e) => ripple.create(e)}
            onClick={() => setActiveTab('timeline')}
            className={`relative overflow-hidden flex flex-col items-center justify-center w-1/3 py-2 rounded-[1.5rem] transition-all duration-300 ${activeTab === 'timeline' ? `${t_bg} ${t_text}` : `${c_textSub} ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}`}
          >
            <CalendarDays className={`${navStyles.icon}`} strokeWidth={activeTab === 'timeline' ? 2.5 : 2} />
            <span className={`font-semibold tracking-wide ${navStyles.text}`}>กำหนดการ</span>
          </button>

          <button
            onMouseDown={(e) => ripple.create(e)}
            onClick={() => setActiveTab('settings')}
            className={`relative overflow-hidden flex flex-col items-center justify-center w-1/3 py-2 rounded-[1.5rem] transition-all duration-300 ${activeTab === 'settings' ? `${t_bg} ${t_text}` : `${c_textSub} ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}`}
          >
            <Settings className={`${navStyles.icon}`} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className={`font-semibold tracking-wide ${navStyles.text}`}>ตั้งค่า</span>
          </button>

        </nav>
      </div>
    </div>
  );
}

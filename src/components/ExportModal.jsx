// ============================================================
// components/ExportModal.jsx — Image export modal (v2)
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays, MapPin, X, Loader2, Download, Copy, Share2, Check,
  Layout, Palette, Type, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Clock3, Globe, Sparkles, BadgeCheck
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { RATIOS, BACKGROUNDS } from '../constants';
import { computeCountdown, formatEventDateRange, formatTimestamp, hasRealLocation, formatLocationForLang } from '../utils';
import { useAppContext } from '../context/AppContext';

// ── Main Component ─────────────────────────────────────────
const ExportModal = ({ open, onClose, event }) => {
  const {
    isDark, c_cardBg, c_cardBorder, c_textMain, c_textSub, activeTheme, t_bg, t_text,
    lang, L, prefs, handleSavePrefs
  } = useAppContext();

  const exportRef = useRef(null);
  const previewContainerRef = useRef(null);

  const [isExporting, setIsExporting] = useState(false);
  const [copyState, setCopyState] = useState('idle'); // idle | copying | copied
  const [previewScale, setPreviewScale] = useState(0.2);

  // Settings state
  const [ratio, setRatio] = useState('9:16');
  const [bgInfo, setBgInfo] = useState(BACKGROUNDS[2]);
  const [textColor, setTextColor] = useState('text-white');
  const [align, setAlign] = useState('items-center text-center');

  const [showTitle, setShowTitle] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showIcons, setShowIcons] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [showPrefix, setShowPrefix] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [countdownStyle, setCountdownStyle] = useState('boxed');

  const [visibleUnits, setVisibleUnits] = useState({
    days: true, hours: true, mins: true, secs: true
  });

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [open]);

  const cd = computeCountdown(event ? event.date : new Date(), now);
  const currentRatio = RATIOS[ratio];

  // Scale calculation
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container || !open) return;

    const updateScale = () => {
      const { clientWidth, clientHeight } = container;
      const padding = 32;
      const availableW = clientWidth - padding;
      const availableH = clientHeight - padding;
      const scaleW = availableW / currentRatio.width;
      const scaleH = availableH / currentRatio.height;
      setPreviewScale(Math.min(scaleW, scaleH));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [currentRatio.width, currentRatio.height, open]);

  if (!open || !event) return null;

  const toggleUnit = (unit) => {
    setVisibleUnits(prev => ({ ...prev, [unit]: !prev[unit] }));
  };

  // ── Generate blob helper ─────────────────────────────────
  const generateBlob = async () => {
    if (!exportRef.current) return null;
    const dataUrl = await htmlToImage.toPng(exportRef.current, {
      quality: 1,
      canvasWidth: currentRatio.width,
      canvasHeight: currentRatio.height,
      pixelRatio: 2
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  // ── Actions ──────────────────────────────────────────────
  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        quality: 1,
        canvasWidth: currentRatio.width,
        canvasHeight: currentRatio.height,
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `countdown-${event.title.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert(L.exportError);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    setCopyState('copying');
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error('No blob');
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      alert(L.copyError);
      setCopyState('idle');
    }
  };

  const handleShare = async () => {
    try {
      const blob = await generateBlob();
      if (!blob) return;
      const file = new File([blob], `countdown-${event.title}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: event.title,
          text: `${L.prefix} ${cd.days} ${L.days} — ${event.title}`,
          files: [file]
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share failed:', err);
    }
  };

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  // ── Units config ─────────────────────────────────────────
  const unitsConfig = [
    { id: 'days', v: cd.days, l: L.days },
    { id: 'hours', v: cd.hours, l: L.hours },
    { id: 'mins', v: cd.minutes, l: L.mins },
    { id: 'secs', v: cd.seconds, l: L.secs }
  ].filter(u => visibleUnits[u.id]);

  // ── isLandscape helper ───────────────────────────────────
  const isLandscape = ratio === '16:9';
  const isSquare = ratio === '1:1';

  // ── Export Content — Responsive per Ratio ────────────────
  const ExportContent = () => {
    // Font sizes scaled per ratio
    const sizes = isLandscape
      ? { title: 'text-[96px]', date: 'text-[36px]', loc: 'text-[32px]', num: 'text-[100px]', label: 'text-[24px]', prefix: 'text-[44px]', ts: 'text-[20px]', wm: 'text-[24px]' }
      : isSquare
        ? { title: 'text-[76px]', date: 'text-[32px]', loc: 'text-[28px]', num: 'text-[92px]', label: 'text-[20px]', prefix: 'text-[38px]', ts: 'text-[20px]', wm: 'text-[22px]' }
        : { title: 'text-[84px]', date: 'text-[36px]', loc: 'text-[32px]', num: 'text-[104px]', label: 'text-[24px]', prefix: 'text-[42px]', ts: 'text-[22px]', wm: 'text-[24px]' };

    const boxMinW = isLandscape ? 'min-w-[200px]' : isSquare ? 'min-w-[180px]' : 'min-w-[210px]';
    const boxPy = isLandscape ? 'py-7' : isSquare ? 'py-6' : 'py-8';
    const boxRound = isLandscape ? 'rounded-[32px]' : isSquare ? 'rounded-[28px]' : 'rounded-[36px]';

    // Countdown Prefix
    const PrefixText = () => {
      if (!showPrefix) return null;
      return (
        <div className={`${sizes.prefix} font-bold opacity-90 tracking-wide mb-4 text-center`}>
          {L.prefix}
        </div>
      );
    };

    // Countdown Block
    const CountdownBlock = ({ gridCls = '' }) => (
      <div className={`flex flex-row flex-wrap items-center justify-center gap-6 ${gridCls}`}>
        {unitsConfig.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {countdownStyle === 'boxed' ? (
              <>
                <div className={`px-3 ${boxPy} ${boxMinW} ${boxRound} border-2 border-white/20 shadow-xl bg-black/10 backdrop-blur-md flex items-center justify-center`}>
                  <span className={`${sizes.num} font-bold text-center tabular-nums leading-none tracking-tighter`}>
                    {(item.v || 0).toString().padStart(2, '0')}
                  </span>
                </div>
                <span className={`${sizes.label} mt-5 font-semibold uppercase tracking-widest opacity-90`}>{item.l}</span>
              </>
            ) : (
              <div className="flex flex-col items-center px-4">
                <span className={`${isLandscape ? 'text-[144px]' : isSquare ? 'text-[110px]' : 'text-[132px]'} font-bold text-center tabular-nums leading-none tracking-tighter`}>
                  {(item.v || 0).toString().padStart(2, '0')}
                </span>
                <span className={`${sizes.label} mt-4 font-semibold uppercase tracking-widest opacity-70`}>{item.l}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );

    // Info Block (title, date, location)
    const InfoBlock = () => (
      <>
        {showTitle && <h1 className={`${sizes.title} font-bold leading-tight drop-shadow-sm mb-6 w-full break-words`}>{event.title}</h1>}
        {showDate && (
          <div className={`${sizes.date} opacity-90 flex items-center gap-4 mb-4`}>
            {showIcons && <CalendarDays size={isLandscape ? 32 : 40} />}
            {formatEventDateRange(event, lang)}
          </div>
        )}
        {showLocation && hasRealLocation(event.location) && (
          <div className={`${sizes.loc} opacity-90 flex items-center gap-4 mb-8 max-w-full break-words`}>
            {showIcons && <MapPin size={isLandscape ? 32 : 40} className="flex-shrink-0" />}
            {formatLocationForLang(event.location, lang)}
          </div>
        )}
      </>
    );

    // Watermark
    const Watermark = () => {
      if (!showWatermark) return null;
      return (
        <div className={`absolute ${sizes.wm} bottom-8 left-10 opacity-40 font-bold tracking-wide drop-shadow-sm z-10`}>
          Countdown<span className="opacity-70">.</span>
        </div>
      );
    };

    // Timestamp
    const Timestamp = () => {
      if (!showTimestamp) return null;
      return (
        <div className={`absolute ${sizes.ts} bottom-8 right-10 opacity-50 font-medium tracking-wide drop-shadow-sm z-10`}>
          {L.timestamp}: {formatTimestamp(now, lang)}
        </div>
      );
    };

    const GlowElements = () => {
      const glowCls = textColor === 'text-white' ? 'bg-white/5' : 'bg-slate-900/5';
      return (
        <>
          <div className={`absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full ${glowCls} blur-[120px] pointer-events-none z-0`}></div>
          <div className={`absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full ${glowCls} blur-[120px] pointer-events-none z-0`}></div>
        </>
      );
    };

    // ── 16:9 Landscape — 2 column layout ────────
    if (isLandscape) {
      return (
        <div
          className={`w-full h-full flex flex-row ${bgInfo.class} ${textColor} relative overflow-hidden`}
          style={{ fontFamily: "'Google Sans', 'Noto Sans Thai', sans-serif" }}
        >
          <GlowElements />

          {/* Left column — info */}
          <div className={`flex-[1.2] flex flex-col justify-center ${align.includes('end') ? 'items-end text-right' : align.includes('start') ? 'items-start text-left' : 'items-center text-center'} p-[5%] z-10`}>
            <InfoBlock />
          </div>

          {/* Divider line */}
          <div className={`w-[2px] h-[40%] ${textColor === 'text-white' ? 'bg-white/15' : 'bg-slate-900/15'} self-center rounded-full z-10`}></div>

          {/* Right column — countdown */}
          <div className="flex-[0.8] flex flex-col items-center justify-center p-[4%] z-10">
            <PrefixText />
            <CountdownBlock gridCls="gap-6" />
          </div>

          <Watermark />
          <Timestamp />
        </div>
      );
    }

    // ── 1:1 Square — compact layout with 2x2 grid ──────
    if (isSquare) {
      return (
        <div
          className={`w-full h-full flex flex-col justify-center ${align} ${bgInfo.class} ${textColor} relative overflow-hidden`}
          style={{ fontFamily: "'Google Sans', 'Noto Sans Thai', sans-serif" }}
        >
          <GlowElements />

          <div className={`w-full flex flex-col ${align} p-[6%] max-w-[1080px] mx-auto z-10`}>
            <InfoBlock />
            <div className={`w-[80px] h-[2px] ${textColor === 'text-white' ? 'bg-white/20' : 'bg-slate-900/20'} my-10 rounded-full z-10 ${align.includes('start') ? 'self-start' : align.includes('end') ? 'self-end' : 'self-center'}`}></div>
            <div className="flex flex-col items-center">
              <PrefixText />
              <CountdownBlock gridCls="gap-6" />
            </div>
          </div>
          <Watermark />
          <Timestamp />
        </div>
      );
    }

    // ── 9:16 Story / 4:5 IG Post — vertical layout ─────
    return (
      <div
        className={`w-full h-full flex flex-col justify-center ${align} ${bgInfo.class} ${textColor} relative overflow-hidden`}
        style={{ fontFamily: "'Google Sans', 'Noto Sans Thai', sans-serif" }}
      >
        <GlowElements />

        <div className={`w-full flex flex-col ${align} p-[6%] max-w-[1080px] mx-auto z-10`}>
          <InfoBlock />
          <div className={`w-[80px] h-[2px] ${textColor === 'text-white' ? 'bg-white/20' : 'bg-slate-900/20'} my-10 rounded-full z-10 ${align.includes('start') ? 'self-start' : align.includes('end') ? 'self-end' : 'self-center'}`}></div>
          <div className="mt-8 flex flex-col items-center">
            <PrefixText />
            <CountdownBlock />
          </div>
        </div>
        <Watermark />
        <Timestamp />
      </div>
    );
  };

  // ── Toggle Button Helper ─────────────────────────────────
  const ToggleBtn = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`py-1.5 px-3 rounded-full border transition-all text-sm ${active ? `${t_bg} ${t_text} border-transparent` : `${c_cardBorder} ${c_textSub} opacity-60`}`}
    >
      {children}
    </button>
  );

  // ── Main Render ──────────────────────────────────────────
  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[70] flex flex-col ${c_cardBg} md:bg-black/80 md:p-6 md:justify-center md:items-center`}>

        <motion.div
          className={`relative w-full h-full md:max-w-5xl md:h-[92vh] flex flex-col md:flex-row md:rounded-3xl overflow-hidden ${c_cardBg} border ${c_cardBorder} shadow-2xl`}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        >
          {/* Header Mobile */}
          <div className={`md:hidden flex justify-between items-center p-4 border-b ${c_cardBorder} z-10 flex-shrink-0`}>
            <h2 className={`text-base font-semibold flex items-center gap-2 ${c_textMain}`}><ImageIcon size={18}/> {L.settingsMobile}</h2>
            <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'} ${c_textMain}`}><X size={18}/></button>
          </div>

          {/* Left: Preview area */}
          <div
            ref={previewContainerRef}
            className="w-full flex-shrink-0 bg-slate-900/95 flex items-center justify-center relative overflow-hidden h-[40vh] md:h-auto md:flex-1 md:border-r border-slate-700"
          >
             <div className="absolute top-4 left-4 hidden md:flex items-center gap-2 text-white/50 text-sm font-medium z-10">
                <ImageIcon size={16}/> Preview Mode
             </div>

             <div
               className="absolute shadow-2xl overflow-hidden bg-black flex-shrink-0 pointer-events-none"
               style={{
                 width: currentRatio.width,
                 height: currentRatio.height,
                 transform: `scale(${previewScale})`,
                 transformOrigin: 'center'
               }}
             >
                <ExportContent />
             </div>
          </div>

          {/* Right: Settings panel */}
          <div className={`w-full flex-1 flex flex-col ${c_cardBg} md:w-[440px] md:flex-none relative overflow-hidden rounded-t-3xl md:rounded-none -mt-4 md:mt-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] md:shadow-none`}>

            <div className={`hidden md:flex p-5 border-b ${c_cardBorder} justify-between items-center z-20 flex-shrink-0`}>
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${c_textMain}`}><ImageIcon size={20}/> {L.settings}</h2>
              <button onClick={onClose} className={`p-2 rounded-full hover:opacity-70 ${c_textMain}`}><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-28 text-sm space-y-6">

              {/* Language */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Globe size={16} className={t_text}/> {L.language}</label>
                <div className={`flex ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'} p-1 rounded-xl`}>
                  <button onClick={() => handleSavePrefs({ ...prefs, lang: 'th' })} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${lang === 'th' ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}>
                    🇹🇭 ไทย
                  </button>
                  <button onClick={() => handleSavePrefs({ ...prefs, lang: 'en' })} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${lang === 'en' ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}>
                    🇺🇸 English
                  </button>
                </div>
              </div>

              {/* Ratio */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Layout size={16} className={t_text}/> {L.ratio}</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(RATIOS).map(r => (
                    <button
                      key={r} onClick={() => setRatio(r)}
                      className={`py-2 px-3 rounded-xl border transition-all ${ratio === r ? `${t_bg} ${t_text} border-transparent font-semibold shadow-sm` : `${c_cardBorder} ${c_textSub} bg-transparent`}`}
                    >
                      {RATIOS[r].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visible time units */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Clock3 size={16} className={t_text}/> {L.units}</label>
                <div className="flex flex-wrap gap-2">
                  <ToggleBtn active={visibleUnits.days} onClick={() => toggleUnit('days')}>{L.days}</ToggleBtn>
                  <ToggleBtn active={visibleUnits.hours} onClick={() => toggleUnit('hours')}>{L.hours}</ToggleBtn>
                  <ToggleBtn active={visibleUnits.mins} onClick={() => toggleUnit('mins')}>{L.mins}</ToggleBtn>
                  <ToggleBtn active={visibleUnits.secs} onClick={() => toggleUnit('secs')}>{L.secs}</ToggleBtn>
                </div>
              </div>

              {/* Info on image */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Layout size={16} className={t_text}/> {L.info}</label>
                <div className="flex flex-wrap gap-2">
                  <ToggleBtn active={showTitle} onClick={() => setShowTitle(!showTitle)}>{L.infoTitle}</ToggleBtn>
                  <ToggleBtn active={showDate} onClick={() => setShowDate(!showDate)}>{L.infoDate}</ToggleBtn>
                  <ToggleBtn active={showLocation} onClick={() => setShowLocation(!showLocation)}>{L.infoLocation}</ToggleBtn>
                  <ToggleBtn active={showIcons} onClick={() => setShowIcons(!showIcons)}>{L.infoIcons}</ToggleBtn>
                  <ToggleBtn active={showTimestamp} onClick={() => setShowTimestamp(!showTimestamp)}>{L.infoTimestamp}</ToggleBtn>
                </div>
              </div>

              {/* Prefix + Watermark toggles */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Sparkles size={16} className={t_text}/> {lang === 'th' ? 'ตัวเลือกเพิ่มเติม' : 'Extra Options'}</label>
                <div className="flex flex-wrap gap-2">
                  <ToggleBtn active={showPrefix} onClick={() => setShowPrefix(!showPrefix)}>{L.showPrefix}</ToggleBtn>
                  <ToggleBtn active={showWatermark} onClick={() => setShowWatermark(!showWatermark)}>{L.showWatermark}</ToggleBtn>
                </div>
              </div>

              {/* Countdown style + Alignment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Type size={16} className={t_text}/> {L.style}</label>
                  <div className={`flex ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'} p-1 rounded-xl`}>
                    <button onClick={() => setCountdownStyle('boxed')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${countdownStyle === 'boxed' ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}>{L.boxed}</button>
                    <button onClick={() => setCountdownStyle('minimal')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${countdownStyle === 'minimal' ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}>{L.minimal}</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><AlignLeft size={16} className={t_text}/> {L.align}</label>
                  <div className={`flex ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'} p-1 rounded-xl justify-between`}>
                    <button onClick={() => setAlign('items-start text-left')} className={`flex-1 flex justify-center py-1.5 rounded-lg transition-all ${align.includes('start') ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}><AlignLeft size={16}/></button>
                    <button onClick={() => setAlign('items-center text-center')} className={`flex-1 flex justify-center py-1.5 rounded-lg transition-all ${align.includes('center') ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}><AlignCenter size={16}/></button>
                    <button onClick={() => setAlign('items-end text-right')} className={`flex-1 flex justify-center py-1.5 rounded-lg transition-all ${align.includes('end') ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}><AlignRight size={16}/></button>
                  </div>
                </div>
              </div>

              {/* Background color */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Palette size={16} className={t_text}/> {L.bgColor}</label>
                <div className="flex flex-wrap gap-3">
                  {BACKGROUNDS.map(bg => (
                    <button
                      key={bg.id} onClick={() => setBgInfo(bg)}
                      className={`w-10 h-10 rounded-full border-2 ${bg.class} transition-all ${bgInfo.id === bg.id ? `border-white shadow-[0_0_0_2px_${activeTheme?.hex || '#3b82f6'}] scale-110` : 'border-slate-300 dark:border-slate-600'}`}
                      title={bg.label}
                    />
                  ))}
                </div>
              </div>

              {/* Text color */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Type size={16} className={t_text}/> {L.textColor}</label>
                <div className="flex gap-3">
                  <button onClick={() => setTextColor('text-white')} className={`w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center transition-all ${textColor === 'text-white' ? `ring-2 ring-offset-2 ring-blue-500 ${isDark ? 'ring-offset-slate-800' : 'ring-offset-slate-50'}` : ''}`}>
                     <span className="text-black text-xs font-bold">A</span>
                  </button>
                  <button onClick={() => setTextColor('text-slate-900')} className={`w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center transition-all ${textColor === 'text-slate-900' ? `ring-2 ring-offset-2 ring-blue-500 ${isDark ? 'ring-offset-slate-800' : 'ring-offset-slate-50'}` : ''}`}>
                     <span className="text-white text-xs font-bold">A</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Action buttons bar */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 pt-8 z-30 border-0 ${c_cardBorder}`} style={{ background: `linear-gradient(to top, ${isDark ? '#1e293b' : '#ffffff'} 70%, transparent)` }}>
              <div className="flex gap-2">
                {/* Download — primary */}
                <button
                  onClick={handleDownload}
                  disabled={isExporting}
                  className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30 ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
                  {isExporting ? L.exporting : L.download}
                </button>

                {/* Copy */}
                <button
                  onClick={handleCopy}
                  disabled={copyState !== 'idle'}
                  className={`px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold border transition-all active:scale-[0.98] ${
                    copyState === 'copied'
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : `${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'} hover:opacity-80`
                  } ${copyState === 'copying' ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {copyState === 'copying' ? <Loader2 className="w-4 h-4 animate-spin"/> : copyState === 'copied' ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                  {copyState === 'copied' ? L.copied : L.copy}
                </button>

                {/* Share — only on supported devices */}
                {canShare && (
                  <button
                    onClick={handleShare}
                    className={`px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold border transition-all active:scale-[0.98] ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'} hover:opacity-80`}
                  >
                    <Share2 className="w-4 h-4"/>
                    {L.share}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hidden Export Node */}
        <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none z-[-1]">
          <div ref={exportRef} style={{ width: `${currentRatio.width}px`, height: `${currentRatio.height}px` }}>
            <ExportContent />
          </div>
        </div>

      </div>
    </AnimatePresence>
  );
};

export default ExportModal;

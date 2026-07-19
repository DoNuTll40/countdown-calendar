// ============================================================
// components/ExportModal.jsx — Image export modal
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays, MapPin, X, Loader2, Download,
  Layout, Palette, Type, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Clock3
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { RATIOS, BACKGROUNDS } from '../constants';
import { computeCountdown, formatEventDateRange, formatTimestamp, hasRealLocation } from '../utils';
import { useAppContext } from '../context/AppContext';

const ExportModal = ({ open, onClose, event }) => {
  const { isDark, c_cardBg, c_cardBorder, c_textMain, c_textSub, activeTheme, t_bg, t_text } = useAppContext();

  const exportRef = useRef(null);
  const previewContainerRef = useRef(null);

  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.2);

  const [ratio, setRatio] = useState('9:16');
  const [bgInfo, setBgInfo] = useState(BACKGROUNDS[2]);
  const [textColor, setTextColor] = useState('text-white');
  const [align, setAlign] = useState('items-center text-center');

  const [showTitle, setShowTitle] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showIcons, setShowIcons] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(true);
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

  // Perfect Scale calculation
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

  const handleExport = async () => {
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
      alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพ');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleUnit = (unit) => {
    setVisibleUnits(prev => ({ ...prev, [unit]: !prev[unit] }));
  };

  // Export content renderer
  const ExportContent = () => {
    const unitsConfig = [
      { id: 'days', v: cd.days, l: 'วัน' },
      { id: 'hours', v: cd.hours, l: 'ชั่วโมง' },
      { id: 'mins', v: cd.minutes, l: 'นาที' },
      { id: 'secs', v: cd.seconds, l: 'วินาที' }
    ].filter(u => visibleUnits[u.id]);

    return (
      <div
        className={`w-full h-full flex flex-col justify-center ${align} ${bgInfo.class} ${textColor} relative overflow-hidden`}
        style={{ fontFamily: "'Google Sans', 'Noto Sans Thai', sans-serif" }}
      >
        <div className={`w-full flex flex-col ${align} p-[6%] max-w-[1080px] mx-auto`}>
          {showTitle && <h1 className="text-[75px] font-bold leading-tight drop-shadow-sm mb-10 max-w-full break-words text-balance">{event.title}</h1>}

          {showDate && (
            <div className="text-[34px] opacity-90 flex items-center gap-4 mb-6">
              {showIcons && <CalendarDays size={40} />}
              {formatEventDateRange(event)}
            </div>
          )}

          {showLocation && hasRealLocation(event.location) && (
            <div className="text-[30px] opacity-90 flex items-center gap-4 mb-16 max-w-full break-words text-balance">
              {showIcons && <MapPin size={40} className="flex-shrink-0" />}
              {event.location}
            </div>
          )}

          <div className={`flex flex-row flex-nowrap items-center justify-center gap-6 mt-8`}>
            {unitsConfig.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                {countdownStyle === 'boxed' ? (
                  <>
                    <div className="px-3 py-8 min-w-[190px] rounded-[32px] border-2 border-white/20 shadow-xl bg-black/10 backdrop-blur-md flex items-center justify-center">
                      <span className="text-[90px] font-bold text-center tabular-nums leading-none tracking-tighter">
                        {(item.v || 0).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[24px] mt-5 font-semibold uppercase tracking-widest opacity-90">{item.l}</span>
                  </>
                ) : (
                  <div className="flex flex-col items-center px-4">
                    <span className="text-[110px] font-bold text-center tabular-nums leading-none tracking-tighter">
                      {(item.v || 0).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[26px] mt-4 font-semibold uppercase tracking-widest opacity-70">{item.l}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <div className="absolute text-[20px] bottom-8 right-10 opacity-60 font-medium tracking-wide drop-shadow-sm z-10">
            อัปเดตเมื่อ: {formatTimestamp(now)}
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[70] flex flex-col ${c_cardBg} md:bg-black/80 md:p-6 md:justify-center md:items-center`}>

        <motion.div
          className={`relative w-full h-full md:max-w-4xl md:h-[90vh] flex flex-col md:flex-row md:rounded-3xl overflow-hidden ${c_cardBg} border ${c_cardBorder} shadow-2xl`}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        >
          {/* Header Mobile */}
          <div className={`md:hidden flex justify-between items-center p-4 border-b ${c_cardBorder} z-10 flex-shrink-0`}>
            <h2 className={`text-base font-semibold flex items-center gap-2 ${c_textMain}`}><ImageIcon size={18}/> ปรับแต่งรูปภาพ</h2>
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
          <div className={`w-full flex-1 flex flex-col ${c_cardBg} md:w-[420px] md:flex-none relative overflow-hidden rounded-t-3xl md:rounded-none -mt-4 md:mt-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] md:shadow-none`}>

            <div className={`hidden md:flex p-5 border-b ${c_cardBorder} justify-between items-center z-20 flex-shrink-0`}>
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${c_textMain}`}><ImageIcon size={20}/> ปรับแต่งก่อนบันทึก</h2>
              <button onClick={onClose} className={`p-2 rounded-full hover:opacity-70 ${c_textMain}`}><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-28 text-sm space-y-7">

              {/* Ratio */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Layout size={16} className={t_text}/> สัดส่วนภาพ (Ratio)</label>
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
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Clock3 size={16} className={t_text}/> แสดงหน่วยเวลา</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => toggleUnit('days')} className={`py-1.5 px-3 rounded-full border transition-all ${visibleUnits.days ? `${t_bg} ${t_text} border-transparent` : `${c_cardBorder} ${c_textSub} opacity-60`}`}>วัน</button>
                  <button onClick={() => toggleUnit('hours')} className={`py-1.5 px-3 rounded-full border transition-all ${visibleUnits.hours ? `${t_bg} ${t_text} border-transparent` : `${c_cardBorder} ${c_textSub} opacity-60`}`}>ชั่วโมง</button>
                  <button onClick={() => toggleUnit('mins')} className={`py-1.5 px-3 rounded-full border transition-all ${visibleUnits.mins ? `${t_bg} ${t_text} border-transparent` : `${c_cardBorder} ${c_textSub} opacity-60`}`}>นาที</button>
                  <button onClick={() => toggleUnit('secs')} className={`py-1.5 px-3 rounded-full border transition-all ${visibleUnits.secs ? `${t_bg} ${t_text} border-transparent` : `${c_cardBorder} ${c_textSub} opacity-60`}`}>วินาที</button>
                </div>
              </div>

              {/* Info on image */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Layout size={16} className={t_text}/> ข้อมูลบนภาพ</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setShowTitle(!showTitle)} className={`py-1.5 px-3 rounded-full border transition-all ${showTitle ? `${t_bg} ${t_text} border-transparent` : `${c_cardBorder} ${c_textSub} opacity-60`}`}>ชื่องาน</button>
                  <button onClick={() => setShowDate(!showDate)} className={`py-1.5 px-3 rounded-full border transition-all ${showDate ? `${t_bg} ${t_text} border-transparent` : `${c_cardBorder} ${c_textSub} opacity-60`}`}>วันที่</button>
                  <button onClick={() => setShowLocation(!showLocation)} className={`py-1.5 px-3 rounded-full border transition-all ${showLocation ? `${t_bg} ${t_text} border-transparent` : `${c_cardBorder} ${c_textSub} opacity-60`}`}>สถานที่</button>
                  <button onClick={() => setShowIcons(!showIcons)} className={`py-1.5 px-3 rounded-full border transition-all ${showIcons ? `${t_bg} ${t_text} border-transparent` : `${c_cardBorder} ${c_textSub} opacity-60`}`}>ไอคอน</button>
                  <button onClick={() => setShowTimestamp(!showTimestamp)} className={`py-1.5 px-3 rounded-full border transition-all ${showTimestamp ? `${t_bg} ${t_text} border-transparent` : `${c_cardBorder} ${c_textSub} opacity-60`}`}>เวลาอัปเดต</button>
                </div>
              </div>

              {/* Countdown style + Alignment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Type size={16} className={t_text}/> สไตล์ตัวนับ</label>
                  <div className={`flex ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'} p-1 rounded-xl`}>
                    <button onClick={() => setCountdownStyle('boxed')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${countdownStyle === 'boxed' ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}>กล่อง</button>
                    <button onClick={() => setCountdownStyle('minimal')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${countdownStyle === 'minimal' ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}>มินิมอล</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><AlignLeft size={16} className={t_text}/> จัดตำแหน่ง</label>
                  <div className={`flex ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'} p-1 rounded-xl justify-between`}>
                    <button onClick={() => setAlign('items-start text-left')} className={`flex-1 flex justify-center py-1.5 rounded-lg transition-all ${align.includes('start') ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}><AlignLeft size={16}/></button>
                    <button onClick={() => setAlign('items-center text-center')} className={`flex-1 flex justify-center py-1.5 rounded-lg transition-all ${align.includes('center') ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}><AlignCenter size={16}/></button>
                    <button onClick={() => setAlign('items-end text-right')} className={`flex-1 flex justify-center py-1.5 rounded-lg transition-all ${align.includes('end') ? `${c_cardBg} ${c_textMain} shadow` : c_textSub}`}><AlignRight size={16}/></button>
                  </div>
                </div>
              </div>

              {/* Background color */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Palette size={16} className={t_text}/> สีพื้นหลัง</label>
                <div className="flex flex-wrap gap-3">
                  {BACKGROUNDS.map(bg => (
                    <button
                      key={bg.id} onClick={() => setBgInfo(bg)}
                      className={`w-10 h-10 rounded-full border-2 ${bg.class} ${bgInfo.id === bg.id ? `border-white shadow-[0_0_0_2px_${activeTheme?.hex || '#3b82f6'}]` : 'border-slate-300 dark:border-slate-600'}`}
                      title={bg.label}
                    />
                  ))}
                </div>
              </div>

              {/* Text color */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${c_textMain}`}><Type size={16} className={t_text}/> สีตัวอักษร</label>
                <div className="flex gap-3">
                  <button onClick={() => setTextColor('text-white')} className={`w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center ${textColor === 'text-white' ? `ring-2 ring-offset-2 ring-blue-500 ${isDark ? 'ring-offset-slate-800' : 'ring-offset-slate-50'}` : ''}`}>
                     <span className="text-black text-xs font-bold">A</span>
                  </button>
                  <button onClick={() => setTextColor('text-slate-900')} className={`w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center ${textColor === 'text-slate-900' ? `ring-2 ring-offset-2 ring-blue-500 ${isDark ? 'ring-offset-slate-800' : 'ring-offset-slate-50'}` : ''}`}>
                     <span className="text-white text-xs font-bold">A</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Export button */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 pt-8 z-30 border-0 ${c_cardBorder}`} style={{ background: `linear-gradient(to top, ${isDark ? '#1e293b' : '#ffffff'} 70%, transparent)` }}>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30 ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5"/>}
                {isExporting ? 'กำลังประมวลผลรูปภาพ...' : 'บันทึกรูปภาพ'}
              </button>
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

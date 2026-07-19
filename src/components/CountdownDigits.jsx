// ============================================================
// components/CountdownDigits.jsx — Countdown timer display
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { computeCountdown } from '../utils';
import { useAppContext } from '../context/AppContext';

const FlipUnit = React.memo(function FlipUnit({ value, label, isDark, c_textMain, c_textSub, index }) {
  const display = (value || 0).toString().padStart(2, '0');
  return (
    <motion.div className="flex flex-col items-center" initial={{ opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}>
      <div className={`${isDark ? 'bg-slate-700 border-slate-600 shadow-none' : 'bg-white border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'} rounded-[20px] p-4 min-w-[4.5rem] h-[4.5rem] flex items-center justify-center mb-2 relative overflow-hidden transition-transform hover:scale-105`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={display} initial={{ y: 24, opacity: 0, filter: 'blur(2px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} exit={{ y: -24, opacity: 0, filter: 'blur(2px)' }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }} className={`text-4xl font-medium tracking-tight ${c_textMain} tabular-nums absolute`}>
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className={`text-[0.6875rem] font-semibold ${c_textSub} uppercase tracking-widest`}>{label}</span>
    </motion.div>
  );
});

const Colon = ({ isDark }) => (
  <motion.div className={`text-3xl font-light ${isDark ? 'text-slate-600' : 'text-slate-300'} mt-3 hidden sm:block`} animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
    :
  </motion.div>
);

const CountdownDigits = React.memo(function CountdownDigits({ targetDate }) {
  const { isDark, c_textMain, c_textSub } = useAppContext();
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

export default CountdownDigits;

// ============================================================
// components/MapEmbed.jsx — Map iframe + address line
// ============================================================

import React from 'react';
import { MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { hasRealLocation, getMapEmbedUrl, getMapsExternalUrl } from '../utils';

export const AddressLine = React.memo(function AddressLine({ location }) {
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
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
          <div className={`mt-3 rounded-2xl overflow-hidden border ${c_cardBorder}`} style={{ transform: 'translateZ(0)', isolation: 'isolate' }}>
            <iframe title={`map-${eventId}`} src={getMapEmbedUrl(location)} width="100%" height="200" style={{ border: 0, display: 'block' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <div className="mt-2 flex justify-end">
            <a href={getMapsExternalUrl(location)} target="_blank" rel="noopener noreferrer" className={`text-[0.6875rem] font-semibold ${t_text} underline underline-offset-2`}>เปิดใน Google Maps</a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default MapEmbed;

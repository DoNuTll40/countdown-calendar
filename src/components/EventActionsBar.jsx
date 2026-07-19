// ============================================================
// components/EventActionsBar.jsx — Share/Map/Meet action buttons
// ============================================================

import React from 'react';
import { Map, ChevronDown, Share2, Check, Video } from 'lucide-react';
import { hasRealLocation } from '../utils';
import { useAppContext } from '../context/AppContext';

const EventActionsBar = React.memo(function EventActionsBar({ event, isMapExpanded, onToggleMap, onShare, isCopied, t_text, t_bg }) {
  const { L } = useAppContext();
  const pillClass = `inline-flex items-center gap-1.5 text-xs font-semibold ${t_text} ${t_bg} px-3 py-1.5 rounded-full transition-colors`;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {hasRealLocation(event.location) && (
        <button onClick={() => onToggleMap(event.id)} className={pillClass}>
          <Map className="w-3.5 h-3.5" />{isMapExpanded ? L.hideMap : L.showMap}<ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMapExpanded ? 'rotate-180' : ''}`} />
        </button>
      )}
      <button onClick={() => onShare(event)} className={pillClass}>{isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}{isCopied ? L.copiedText : L.shareText}</button>
      {event.meetLink && <a href={event.meetLink} target="_blank" rel="noopener noreferrer" className={pillClass}><Video className="w-3.5 h-3.5" /> {L.joinMeet}</a>}
    </div>
  );
});

export default EventActionsBar;

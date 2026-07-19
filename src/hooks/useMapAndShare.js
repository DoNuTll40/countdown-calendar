// ============================================================
// hooks/useMapAndShare.js — Map toggle & share actions
// ============================================================

import { useState, useCallback } from 'react';
import { buildShareText } from '../utils';

export function useMapAndShare() {
  const [expandedMapIds, setExpandedMapIds] = useState(() => new Set());
  const [copiedId, setCopiedId] = useState(null);

  const toggleMap = useCallback((id) => {
    setExpandedMapIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

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

  return { expandedMapIds, toggleMap, copiedId, handleShare };
}

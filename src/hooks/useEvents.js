// ============================================================
// hooks/useEvents.js — Google Calendar + Neon DB data
// ============================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { neon } from '@neondatabase/serverless';
import { ENV } from '../constants';
import { stripHtml } from '../utils';

export function useEvents(upcomingCount = 3, heroEventId = undefined) {
  const [events, setEvents] = useState([]);
  const [dbHeroId, setDbHeroId] = useState(null);
  const [dbStatus, setDbStatus] = useState('offline');
  const [isNeonLoading, setIsNeonLoading] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(true);

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
      } else setDbStatus('offline');
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
          return { id: item.id, title: item.summary, date: startDate, endDate, location: item.location || 'ไม่ระบุสถานที่', description: stripHtml(item.description), htmlLink: item.htmlLink || null, meetLink, isRecurring: !!item.recurringEventId, type: 'google' };
        });
        setEvents(formattedEvents);
      }
    } catch (error) { /* silent fail */ }
    setIsGoogleLoading(false);
  }, []);

  const refreshAll = useCallback(() => {
    fetchGoogleEvents();
    fetchNeonHero();
  }, [fetchGoogleEvents, fetchNeonHero]);

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
    return events.filter(e => e.id !== heroEvent?.id).slice(0, upcomingCount || 3);
  }, [events, heroEvent, upcomingCount]);

  return {
    events,
    heroEvent,
    upcomingEvents,
    dbStatus,
    isAppLoading,
    handleSetHero,
    refreshAll,
  };
}

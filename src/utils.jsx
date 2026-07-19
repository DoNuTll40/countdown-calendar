// ============================================================
// utils.js — Pure utility functions (no side-effects)
// ============================================================

import React from 'react';
import { VALID_TABS } from './constants';

// --- System Setup ---
export const injectSystemSettings = () => {
  if (!document.getElementById("app-fonts")) {
    const style = document.createElement("style");
    style.id = "app-fonts";

    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap');

      html {
        transition: font-size .2s ease;
      }

      body {
        margin: 0;
        overflow-x: hidden;
        touch-action: pan-y;
        transition: background-color .3s ease;
      }

      .font-google {
        font-family: "Google Sans", sans-serif;
      }
    `;

    document.head.appendChild(style);
  }

  let meta = document.querySelector('meta[name="viewport"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "viewport";
    document.head.appendChild(meta);
  }

  meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
};

// --- Tab Navigation ---
export const getInitialTab = () => {
  const fromHash = window.location.hash.replace('#', '');
  if (VALID_TABS.includes(fromHash)) return fromHash;
  const fromStorage = localStorage.getItem('last_tab');
  if (VALID_TABS.includes(fromStorage)) return fromStorage;
  return 'dashboard';
};

// --- Location Helpers ---
export const hasRealLocation = (location) => !!location && location !== 'ไม่ระบุสถานที่';
export const getMapEmbedUrl = (location) => `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
export const getMapsExternalUrl = (location) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

// --- Date Formatting ---
export const formatThaiDate = (date) => date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
export const formatTimestamp = (date) => date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
export const isMultiDay = (event) => event.endDate && event.date.toDateString() !== event.endDate.toDateString();
export const formatEventDateRange = (event) => isMultiDay(event) ? `${formatThaiDate(event.date)} - ${formatThaiDate(event.endDate)}` : formatThaiDate(event.date);

// --- Text Cleaning ---
export const stripHtml = (html) => html
  ? html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/[ \t]+/g, ' ').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  : '';

export const cleanSpanArtifacts = (text) => text ? text.replace(/\[span_\d+\]\((?:start_span|end_span)\)/g, '') : '';

// --- Share ---
export const buildShareText = (event) => {
  let text = `${event.title}\n${formatEventDateRange(event)}`;
  if (hasRealLocation(event.location)) text += `\n${event.location}`;
  return text;
};

// --- Countdown ---
export const computeCountdown = (targetDate, now) => {
  const diff = targetDate - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
};

// --- Markdown Components Builder ---
export const buildMarkdownComponents = (t_text, compact = true) => ({
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
    <a target="_blank" rel="noopener noreferrer" className={`underline underline-offset-2 break-all ${t_text}`} {...props} />
  ),
});

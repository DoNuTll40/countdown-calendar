import React from 'react';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get('title') || 'Countdown';
  const date = searchParams.get('date') || '';
  const location = searchParams.get('location') || '';
  const theme = searchParams.get('theme') || 'blue';

  // Calculate countdown if date is provided
  let countdownText = '';
  if (date) {
    const target = new Date(date);
    const now = new Date();
    const diff = target - now;
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      countdownText = `อีก ${days} วัน ${hours} ชั่วโมง`;
    }
  }

  // Theme gradients
  const gradients = {
    blue: { from: '#2563eb', to: '#7c3aed' },
    emerald: { from: '#10b981', to: '#0f766e' },
    violet: { from: '#8b5cf6', to: '#6366f1' },
    rose: { from: '#e11d48', to: '#f97316' },
  };

  const gradient = gradients[theme] || gradients.blue;

  // Fetch Kanit font to support Thai glyphs (prevent tofu boxes ▢▢▢)
  const fontData = await fetch(
    new URL('https://github.com/google/fonts/raw/main/ofl/kanit/Kanit-Medium.ttf')
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
          color: 'white',
          fontFamily: 'Kanit',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        {/* Countdown prefix */}
        {countdownText && (
          <div
            style={{
              fontSize: '32px',
              fontWeight: 700,
              opacity: 0.9,
              marginBottom: '16px',
              letterSpacing: '2px',
            }}
          >
            {countdownText}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
            textShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {title}
        </div>

        {/* Date */}
        {date && (
          <div
            style={{
              fontSize: '28px',
              opacity: 0.85,
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            📅 {new Date(date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}

        {/* Location */}
        {location && (
          <div
            style={{
              fontSize: '24px',
              opacity: 0.75,
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            📍 {location}
          </div>
        )}

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '40px',
            fontSize: '20px',
            fontWeight: 700,
            opacity: 0.4,
          }}
        >
          Countdown.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Kanit',
          data: fontData,
          style: 'normal',
        },
      ],
    },
  );
}

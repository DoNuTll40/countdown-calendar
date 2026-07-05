// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Countdown App',
        short_name: 'Countdown',
        description: 'แอปนับถอยหลังกิจกรรมสำคัญ',
        theme_color: '#fafafa',
        background_color: '#fafafa',
        display: "standalone", // อันนี้สำคัญ ทำให้เปิดมาไม่มีแถบ URL (เหมือนแอปจริง)
        icons: [
          {
            src: '/pwa-192x192.png', // ไปหาไอคอนขนาด 192x192 มาใส่ในโฟลเดอร์ public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png', // ไปหาไอคอนขนาด 512x512 มาใส่ในโฟลเดอร์ public
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})

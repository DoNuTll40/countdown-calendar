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
            src: 'pwa-192x192.png', // ไปหาไอคอนขนาด 192x192 มาใส่ในโฟลเดอร์ public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // ไปหาไอคอนขนาด 512x512 มาใส่ในโฟลเดอร์ public
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ], // <--- ปิด Array ของ plugins ตรงนี้
  server: { // <--- ย้าย server ออกมาอยู่ระดับเดียวกับ plugins
    proxy: {
      // เมื่อ React เรียก API ที่ขึ้นต้นด้วย /camera-proxy
      '/camera-proxy': {
        target: 'https://iocpiramid.com:8085', // ให้ Vite วิ่งไปดึงจากของจริง
        changeOrigin: true,
        secure: false, // ยอมรับ SSL ที่อาจจะมีปัญหา
        rewrite: (path) => path.replace(/^\/camera-proxy/, ''), // ตัดคำว่า /camera-proxy ออกตอนส่งไปหลังบ้าน
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // "พระเอกของเราอยู่ตรงนี้" - สั่งลบ Header ที่ห้ามทำ Iframe ทิ้ง!
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
          });
        }
      }
    }
  }
})

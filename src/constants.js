// ============================================================
// constants.js — ค่าคงที่ทั้งหมดของแอป
// ============================================================

export const THEMES = {
  blue: { bgLight: 'bg-blue-50', bgDark: 'bg-blue-500/20', textLight: 'text-blue-600', textDark: 'text-blue-400', borderLight: 'border-blue-200', borderDark: 'border-blue-500/30', hex: '#2563eb' },
  emerald: { bgLight: 'bg-emerald-50', bgDark: 'bg-emerald-500/20', textLight: 'text-emerald-600', textDark: 'text-emerald-400', borderLight: 'border-emerald-200', borderDark: 'border-emerald-500/30', hex: '#10b981' },
  violet: { bgLight: 'bg-violet-50', bgDark: 'bg-violet-500/20', textLight: 'text-violet-600', textDark: 'text-violet-400', borderLight: 'border-violet-200', borderDark: 'border-violet-500/30', hex: '#8b5cf6' },
  rose: { bgLight: 'bg-rose-50', bgDark: 'bg-rose-500/20', textLight: 'text-rose-600', textDark: 'text-rose-400', borderLight: 'border-rose-200', borderDark: 'border-rose-500/30', hex: '#e11d48' }
};

export const FONT_SIZE_PX = { sm: 14, base: 16, lg: 19 };

export const VALID_TABS = ['dashboard', 'timeline', 'settings'];

export const UPCOMING_COUNT_OPTIONS = [3, 5, 10];

export const RATIOS = {
  '1:1': { width: 1080, height: 1080, label: 'Square (1:1)' },
  '4:5': { width: 1080, height: 1350, label: 'IG Post (4:5)' },
  '9:16': { width: 1080, height: 1920, label: 'Story (9:16)' },
  '16:9': { width: 1920, height: 1080, label: 'Landscape (16:9)' }
};

export const BACKGROUNDS = [
  { id: 'solid-dark', class: 'bg-slate-900', label: 'Dark' },
  { id: 'solid-light', class: 'bg-slate-50', label: 'Light' },
  { id: 'grad-blue', class: 'bg-gradient-to-br from-blue-600 to-violet-600', label: 'Blue' },
  { id: 'grad-rose', class: 'bg-gradient-to-br from-rose-500 to-orange-400', label: 'Rose' },
  { id: 'grad-emerald', class: 'bg-gradient-to-br from-emerald-500 to-teal-700', label: 'Emerald' },
  { id: 'grad-sunset', class: 'bg-gradient-to-br from-amber-500 via-pink-500 to-purple-600', label: 'Sunset' },
  { id: 'grad-ocean', class: 'bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-800', label: 'Ocean' },
  { id: 'grad-midnight', class: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900', label: 'Midnight' },
  { id: 'grad-neon', class: 'bg-gradient-to-br from-green-400 via-cyan-500 to-blue-600', label: 'Neon' },
];

export const TRANSLATIONS = {
  th: {
    prefix: 'อีก',
    days: 'วัน', hours: 'ชั่วโมง', mins: 'นาที', secs: 'วินาที',
    timestamp: 'อัปเดตเมื่อ',
    download: 'บันทึก', copy: 'คัดลอก', share: 'แชร์',
    exporting: 'กำลังประมวลผล...', copied: 'คัดลอกแล้ว!',
    settings: 'ปรับแต่งก่อนบันทึก', settingsMobile: 'ปรับแต่งรูปภาพ',
    ratio: 'สัดส่วนภาพ', units: 'แสดงหน่วยเวลา', info: 'ข้อมูลบนภาพ',
    style: 'สไตล์ตัวนับ', align: 'จัดตำแหน่ง', bgColor: 'สีพื้นหลัง',
    textColor: 'สีตัวอักษร', language: 'ภาษา',
    infoTitle: 'ชื่องาน', infoDate: 'วันที่', infoLocation: 'สถานที่',
    infoIcons: 'ไอคอน', infoTimestamp: 'เวลาอัปเดต',
    boxed: 'กล่อง', minimal: 'มินิมอล',
    showPrefix: 'แสดง "อีก..."', showWatermark: 'Watermark',
    exportError: 'เกิดข้อผิดพลาดในการบันทึกรูปภาพ',
    copyError: 'ไม่สามารถคัดลอกได้',

    // App strings
    home: 'หน้าแรก',
    timeline: 'กำหนดการ',
    settingsTab: 'ตั้งค่า',
    appSettings: 'ตั้งค่าแอปพลิเคชัน',
    darkMode: 'โหมดกลางคืน',
    darkModeDesc: 'ถนอมสายตาในที่มืด',
    themeColor: 'ธีมสีหลัก (Theme Color)',
    fontSize: 'ขนาดตัวอักษร',
    fontSmall: 'เล็ก',
    fontNormal: 'ปกติ',
    fontLarge: 'ใหญ่',
    bottomNavSize: 'ขนาดแถบเมนู (Bottom Nav)',
    upcomingCountLabel: 'จำนวนรายการ "กำลังจะมาถึง"',
    upcomingCountDesc: 'แสดงในหน้าแรกใต้ตัวนับถอยหลัง',
    items: 'รายการ',
    allSchedules: 'กำหนดการทั้งหมด',
    syncing: 'กำลังซิงค์ข้อมูล...',
    loading: 'กำลังโหลด...',
    noEvents: 'ยังไม่มีกิจกรรม',
    pinnedEvent: 'Pinned Event',
    showMap: 'ดูแผนที่',
    hideMap: 'ซ่อนแผนที่',
    exportImage: 'ส่งออกภาพ',
    upcoming: 'กำลังจะมาถึง',
    viewAll: 'ดูทั้งหมด',
    viewMore: 'ดูเพิ่มเติม',
    copiedText: 'คัดลอกแล้ว',
    shareText: 'แชร์',
    joinMeet: 'เข้าร่วม Meet',
    noDetails: 'ไม่มีรายละเอียดเพิ่มเติม',
    noLocation: 'ไม่ระบุสถานที่',
    recurring: 'ประจำ',
    openInGoogleMaps: 'เปิดใน Google Maps'
  },
  en: {
    prefix: 'in',
    days: 'Days', hours: 'Hours', mins: 'Mins', secs: 'Secs',
    timestamp: 'Updated',
    download: 'Save', copy: 'Copy', share: 'Share',
    exporting: 'Processing...', copied: 'Copied!',
    settings: 'Customize before saving', settingsMobile: 'Customize Image',
    ratio: 'Aspect Ratio', units: 'Time Units', info: 'Image Info',
    style: 'Counter Style', align: 'Alignment', bgColor: 'Background',
    textColor: 'Text Color', language: 'Language',
    infoTitle: 'Title', infoDate: 'Date', infoLocation: 'Location',
    infoIcons: 'Icons', infoTimestamp: 'Timestamp',
    boxed: 'Boxed', minimal: 'Minimal',
    showPrefix: 'Show "in..."', showWatermark: 'Watermark',
    exportError: 'Failed to export image',
    copyError: 'Could not copy to clipboard',

    // App strings
    home: 'Home',
    timeline: 'Timeline',
    settingsTab: 'Settings',
    appSettings: 'App Settings',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Comfortable viewing in dark',
    themeColor: 'Primary Theme Color',
    fontSize: 'Font Size',
    fontSmall: 'Small',
    fontNormal: 'Normal',
    fontLarge: 'Large',
    bottomNavSize: 'Bottom Nav Size',
    upcomingCountLabel: 'Upcoming Items Count',
    upcomingCountDesc: 'Displayed below the counter on the home page',
    items: 'items',
    allSchedules: 'All Schedules',
    syncing: 'Syncing data...',
    loading: 'Loading...',
    noEvents: 'No events found',
    pinnedEvent: 'Pinned Event',
    showMap: 'Show Map',
    hideMap: 'Hide Map',
    exportImage: 'Export Image',
    upcoming: 'Upcoming',
    viewAll: 'View All',
    viewMore: 'Read More',
    copiedText: 'Copied',
    shareText: 'Share',
    joinMeet: 'Join Meet',
    noDetails: 'No description available',
    noLocation: 'No location specified',
    recurring: 'Recurring',
    openInGoogleMaps: 'Open in Google Maps'
  },
};

export const ENV = {
  GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',
  CALENDAR_ID: import.meta.env.VITE_CALENDAR_ID || '',
  NEON_DB_STRING: import.meta.env.VITE_NEON_DB_STRING || ''
};

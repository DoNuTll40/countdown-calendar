// ============================================================
// App.jsx — Main Orchestrator
// ============================================================

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { AppProvider, useAppContext } from './context/AppContext';
import { useNavigation } from './hooks/useNavigation';
import { useEvents } from './hooks/useEvents';
import { useMapAndShare } from './hooks/useMapAndShare';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';
import TimelineView from './components/TimelineView';
import SettingsView from './components/SettingsView';
import ExportModal from './components/ExportModal';

function AppContent() {
  const { prefs, c_bgMain, c_textMain, t_bg } = useAppContext();
  const { activeTab, setActiveTab } = useNavigation();
  const { events, heroEvent, upcomingEvents, dbStatus, isAppLoading, handleSetHero, refreshAll } = useEvents(prefs.upcomingCount);
  const { expandedMapIds, toggleMap, copiedId, handleShare } = useMapAndShare();
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className={`font-google min-h-screen ${c_bgMain} ${c_textMain} pb-36 selection:${t_bg} transition-colors duration-300`}>
      <Header dbStatus={dbStatus} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <DashboardView
              heroEvent={heroEvent}
              upcomingEvents={upcomingEvents}
              isAppLoading={isAppLoading}
              expandedMapIds={expandedMapIds}
              onToggleMap={toggleMap}
              onTabChange={setActiveTab}
              onShowExport={() => setShowExportModal(true)}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              events={events}
              heroEventId={heroEvent?.id}
              isAppLoading={isAppLoading}
              expandedMapIds={expandedMapIds}
              onToggleMap={toggleMap}
              onSetHero={handleSetHero}
              onRefresh={refreshAll}
              onShare={handleShare}
              copiedId={copiedId}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </AnimatePresence>

        <ExportModal
          open={showExportModal}
          onClose={() => setShowExportModal(false)}
          event={heroEvent}
        />
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

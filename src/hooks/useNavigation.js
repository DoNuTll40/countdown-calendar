// ============================================================
// hooks/useNavigation.js — Tab navigation + system setup
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { VALID_TABS } from '../constants';
import { getInitialTab, injectSystemSettings } from '../utils';

export function useNavigation() {
  const [activeTab, setActiveTabState] = useState(getInitialTab);

  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    window.location.hash = tab;
    localStorage.setItem('last_tab', tab);
  }, []);

  useEffect(() => {
    injectSystemSettings();

    const preventDoubleTapZoom = (e) => { if (e.touches.length > 1) e.preventDefault(); };
    document.addEventListener('touchstart', preventDoubleTapZoom, { passive: false });

    const handleHashChange = () => {
      const tab = window.location.hash.replace('#', '');
      if (VALID_TABS.includes(tab)) {
        setActiveTabState(tab);
        localStorage.setItem('last_tab', tab);
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    if (!window.location.hash) window.location.hash = getInitialTab();

    return () => {
      document.removeEventListener('touchstart', preventDoubleTapZoom);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return { activeTab, setActiveTab };
}

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar, NavTab, SidebarThemeMode } from './components/Sidebar';
import { DefectThresholdMappingView } from './views/DefectThresholdMappingView';
import { AllActivitiesView } from './views/AllActivitiesView';
import { SupportingViews } from './views/SupportingViews';
import { HierarchyPayload, qmsApi } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') as NavTab | null;
    return view || 'defect-logging';
  });

  const [themeMode, setThemeMode] = useState<SidebarThemeMode>('auto');
  const [hierarchy, setHierarchy] = useState<HierarchyPayload | null>(null);
  const [initialSubActivityFilter, setInitialSubActivityFilter] = useState<{
    activityId?: string;
    subActivityId?: string;
  } | null>(null);

  const loadHierarchy = useCallback(async () => {
    try {
      const data = await qmsApi.getHierarchy();
      setHierarchy(data);
    } catch (e) {
      console.error('Error loading hierarchy:', e);
    }
  }, []);

  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  const handleNavigateToThresholds = (activityId: number, subActivityId: number) => {
    setInitialSubActivityFilter({
      activityId: String(activityId),
      subActivityId: String(subActivityId),
    });
    setActiveTab('defect-logging');
  };

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-[#18181B]">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingIrCount={hierarchy?.stats.pending_inspection_requests ?? 19}
        themeMode={themeMode}
        onChangeThemeMode={setThemeMode}
      />

      {activeTab === 'defect-logging' ? (
        <DefectThresholdMappingView
          hierarchy={hierarchy}
          initialSubActivityFilter={initialSubActivityFilter}
          onClearInitialFilter={() => setInitialSubActivityFilter(null)}
          onRefreshHierarchy={loadHierarchy}
        />
      ) : activeTab === 'activities' ? (
        <AllActivitiesView
          onNavigateToThresholds={handleNavigateToThresholds}
          onRefreshHierarchy={loadHierarchy}
        />
      ) : (
        <SupportingViews
          tab={activeTab}
          hierarchy={hierarchy}
          onSelectTab={setActiveTab}
          onRefreshHierarchy={loadHierarchy}
        />
      )}
    </div>
  );
}

export default App;

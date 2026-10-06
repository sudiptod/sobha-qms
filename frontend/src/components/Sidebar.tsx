import React from 'react';
import {
  Settings,
  AlertCircle,
  Home,
  Layers,
  Building2,
  HardHat,
  Headphones,
  ClipboardList,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'defect-logging'
  | 'activities'
  | 'inspection-requests'
  | 'dashboard'
  | 'divisions'
  | 'projects'
  | 'foreman'
  | 'admin-config'
  | 'settings';

export type SidebarThemeMode = 'auto' | 'dark-sobha' | 'light-clean';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingIrCount: number;
  themeMode: SidebarThemeMode;
  onChangeThemeMode: (mode: SidebarThemeMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingIrCount,
  themeMode,
  onChangeThemeMode,
}) => {
  // Determine effective visual theme:
  // In 'auto' mode, Screen 1 (defect-logging / admin-config) uses the SOBHA Dark sidebar
  // and Screen 2 (activities / inspection-requests / dashboard / etc.) uses the Light sidebar.
  const isDark =
    themeMode === 'dark-sobha' ||
    (themeMode === 'auto' && (activeTab === 'defect-logging' || activeTab === 'admin-config'));

  if (isDark) {
    return (
      <aside className="w-[245px] shrink-0 bg-[#1B1B1B] text-white flex flex-col justify-between min-h-screen select-none shadow-xl">
        <div>
          {/* SOBHA Brand Header (Exact match to Screenshot 1) */}
          <div className="px-5 pt-6 pb-5">
            <div
              onClick={() => onSelectTab('defect-logging')}
              className="bg-[#141414] border border-white/5 rounded-md py-4 px-4 flex items-center justify-center cursor-pointer hover:border-[#C5A06E]/40 transition"
            >
              <span className="font-sobha text-[24px] font-semibold text-[#C5A06E] tracking-[0.22em]">
                SOBHA
              </span>
            </div>
          </div>

          {/* MAIN MENU (Exact match to Screenshot 1 + Unified Modules) */}
          <div className="px-4 mt-2">
            <div className="px-3 mb-3 text-[11px] font-medium tracking-wider text-gray-300 uppercase">
              MAIN MENU
            </div>

            <nav className="space-y-1.5">
              <button
                onClick={() => onSelectTab('admin-config')}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[13.5px] font-medium transition ${
                  activeTab === 'admin-config'
                    ? 'bg-[#B89768] text-white shadow-sm'
                    : 'text-gray-200 hover:bg-white/5'
                }`}
              >
                <Settings className="w-5 h-5 shrink-0 stroke-[1.8]" />
                <span>Admin Configuration</span>
              </button>

              <button
                onClick={() => onSelectTab('inspection-requests')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[13.5px] font-medium transition ${
                  activeTab === 'inspection-requests'
                    ? 'bg-[#B89768] text-white shadow-sm'
                    : 'text-gray-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 shrink-0 stroke-[1.8]" />
                  </div>
                  <span>Inspection Requests</span>
                </div>
                <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full font-semibold">
                  +{pendingIrCount}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('defect-logging')}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[13.5px] font-medium transition ${
                  activeTab === 'defect-logging'
                    ? 'bg-[#B89768] text-white shadow-md'
                    : 'text-gray-200 hover:bg-white/5'
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0 fill-white text-[#B89768]" />
                <span>Defect Logging</span>
              </button>
            </nav>

            {/* Quick Navigation to Screen 2 & Supporting Modules */}
            <div className="px-3 mt-7 mb-2.5 text-[10.5px] font-medium tracking-wider text-gray-400 uppercase">
              OPERATIONS & WBS
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => onSelectTab('activities')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-medium transition ${
                  activeTab === 'activities'
                    ? 'bg-[#B89768] text-white'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <ClipboardList className="w-4 h-4 shrink-0" />
                  <span>All Activities</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C5A06E]/20 text-[#C5A06E]">
                  Screen 2
                </span>
              </button>

              <button
                onClick={() => onSelectTab('dashboard')}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition ${
                  activeTab === 'dashboard'
                    ? 'bg-[#B89768] text-white'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => onSelectTab('divisions')}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition ${
                  activeTab === 'divisions'
                    ? 'bg-[#B89768] text-white'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Divisions</span>
              </button>

              <button
                onClick={() => onSelectTab('projects')}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition ${
                  activeTab === 'projects'
                    ? 'bg-[#B89768] text-white'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Projects</span>
              </button>

              <button
                onClick={() => onSelectTab('foreman')}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition ${
                  activeTab === 'foreman'
                    ? 'bg-[#B89768] text-white'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <HardHat className="w-4 h-4 shrink-0" />
                <span>Foreman</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Theme Switcher Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C5A06E]" /> Sidebar Style
            </span>
            <span className="uppercase text-[10px] text-[#C5A06E] font-semibold">{themeMode}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-[#121212] p-1 rounded-lg text-[11px]">
            {(['auto', 'dark-sobha', 'light-clean'] as SidebarThemeMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onChangeThemeMode(m)}
                className={`py-1 rounded font-medium transition ${
                  themeMode === m
                    ? 'bg-[#B89768] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'auto' ? 'Auto' : m === 'dark-sobha' ? 'Sobha' : 'Light'}
              </button>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // Light Sidebar (Exact match to Screenshot 2: "All Activities")
  return (
    <aside className="w-[245px] shrink-0 bg-white text-[#1E1E1E] border-r border-gray-100 flex flex-col justify-between min-h-screen select-none">
      <div>
        {/* Brand Header (Exact match to Screenshot 2) */}
        <div className="px-6 pt-6 pb-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-[#C5A06E] font-sobha text-xs font-bold">
            S
          </div>
          <span className="text-[22px] font-semibold text-[#1E293B] tracking-tight">
            Logo
          </span>
        </div>

        {/* MAIN MENU */}
        <div className="px-4 mt-2">
          <div className="px-3 mb-2.5 text-[11px] font-medium tracking-wider text-gray-400 uppercase">
            MAIN MENU
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13.5px] font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* Insp. Request with overlapping pill badge (+19) matching Screenshot 2 */}
            <button
              onClick={() => onSelectTab('inspection-requests')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13.5px] font-medium transition ${
                activeTab === 'inspection-requests' || activeTab === 'activities'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4 shrink-0" />
                <span>Insp. Request</span>
              </div>
              <div className="flex items-center -space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-gray-400/70 inline-block border border-black/20" />
                <span className="w-4 h-4 rounded-full bg-gray-300/80 inline-block border border-black/20" />
                <span className="px-1.5 py-0.5 rounded-full bg-white text-black text-[10px] font-bold leading-none shadow">
                  +{pendingIrCount}
                </span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('activities')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13.5px] font-medium transition ${
                activeTab === 'activities'
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <ClipboardList className="w-4 h-4 shrink-0" />
                <span>Activity</span>
              </div>
              {activeTab === 'activities' && (
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('divisions')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13.5px] font-medium transition ${
                activeTab === 'divisions'
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Division</span>
            </button>

            <button
              onClick={() => onSelectTab('projects')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13.5px] font-medium transition ${
                activeTab === 'projects'
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Projects</span>
            </button>

            <button
              onClick={() => onSelectTab('foreman')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13.5px] font-medium transition ${
                activeTab === 'foreman'
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <HardHat className="w-4 h-4 shrink-0" />
              <span>Foreman</span>
            </button>

            {/* Direct Switch to Screen 1: Defect Threshold Mapping */}
            <button
              onClick={() => onSelectTab('defect-logging')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13.5px] font-medium transition ${
                activeTab === 'defect-logging'
                  ? 'bg-[#B89768] text-white'
                  : 'text-gray-600 hover:bg-amber-50/70 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#B89768]" />
                <span>Defect Logging</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                Screen 1
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* HELP & SUPPORT Footer (Exact match to Screenshot 2) */}
      <div className="px-4 pb-4">
        <div className="px-3 mb-2 text-[11px] font-medium tracking-wider text-gray-400 uppercase">
          HELP & SUPPORT
        </div>
        <nav className="space-y-1 mb-3">
          <button
            onClick={() => onSelectTab('admin-config')}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13.5px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
          >
            <Headphones className="w-4 h-4 shrink-0" />
            <span>Help & Center</span>
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13.5px] font-medium transition ${
              activeTab === 'settings'
                ? 'bg-gray-100 text-gray-900 font-semibold'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Setting</span>
          </button>
        </nav>

        <div className="pt-3 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg text-[11px]">
            {(['auto', 'dark-sobha', 'light-clean'] as SidebarThemeMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onChangeThemeMode(m)}
                className={`py-1 rounded font-medium transition ${
                  themeMode === m
                    ? 'bg-black text-white'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {m === 'auto' ? 'Auto' : m === 'dark-sobha' ? 'Sobha' : 'Light'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

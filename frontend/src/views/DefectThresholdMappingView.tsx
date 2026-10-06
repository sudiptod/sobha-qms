import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Pencil,
  Trash2,
  ChevronRight,
  Check,
  X,
  Plus,
  RotateCcw,
} from 'lucide-react';
import {
  DefectThresholdMapping,
  DefectThresholdFilters,
  HierarchyPayload,
  qmsApi,
} from '../services/api';

interface DefectThresholdMappingViewProps {
  hierarchy: HierarchyPayload | null;
  initialSubActivityFilter?: { activityId?: string; subActivityId?: string } | null;
  onClearInitialFilter?: () => void;
  onRefreshHierarchy: () => void;
}

export const DefectThresholdMappingView: React.FC<DefectThresholdMappingViewProps> = ({
  hierarchy,
  initialSubActivityFilter,
  onClearInitialFilter,
  onRefreshHierarchy,
}) => {
  const [rows, setRows] = useState<DefectThresholdMapping[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAll, setShowAll] = useState<boolean>(false);

  // 7 Filter Dropdown States (matching Screenshot 1)
  const [draftFilters, setDraftFilters] = useState<DefectThresholdFilters>({
    project_id: '',
    division_id: '',
    sub_division_id: '',
    activity_id: '',
    sub_activity_id: '',
    severity_index: '',
    control_index: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<DefectThresholdFilters>({});

  // Inline editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<DefectThresholdMapping>>({});

  // Add / Full Edit Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRule, setNewRule] = useState({
    project_id: 1,
    division_id: 1,
    sub_division_id: 1,
    activity_id: 1,
    sub_activity_id: 1,
    defect_type: '',
    defect_threshold: 60,
    sporadic_threshold: 5,
    chronic_threshold: 20,
    severity_index: 4,
    control_index: 8,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  useEffect(() => {
    if (initialSubActivityFilter) {
      const nextFilters: DefectThresholdFilters = {
        ...draftFilters,
        activity_id: initialSubActivityFilter.activityId || '',
        sub_activity_id: initialSubActivityFilter.subActivityId || '',
      };
      setDraftFilters(nextFilters);
      setAppliedFilters(nextFilters);
      if (onClearInitialFilter) onClearInitialFilter();
    }
  }, [initialSubActivityFilter]);

  const fetchThresholds = async (activeFilters: DefectThresholdFilters, search: string) => {
    setLoading(true);
    try {
      const data = await qmsApi.getDefectThresholds({
        ...activeFilters,
        search: search.trim() || undefined,
      });
      setRows(data);
    } catch (err) {
      console.error('Failed to load defect threshold mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThresholds(appliedFilters, searchQuery);
  }, [appliedFilters, searchQuery]);

  // Cascading options from Hierarchy
  const projects = hierarchy?.projects || [];
  const divisions = (hierarchy?.divisions || []).filter(
    (d) => !draftFilters.project_id || String(d.project_id) === String(draftFilters.project_id)
  );
  const subDivisions = (hierarchy?.sub_divisions || []).filter(
    (sd) => !draftFilters.division_id || String(sd.division_id) === String(draftFilters.division_id)
  );
  const activities = (hierarchy?.activities || []).filter(
    (a) =>
      !draftFilters.sub_division_id ||
      String(a.sub_division_id) === String(draftFilters.sub_division_id)
  );
  const subActivities = (hierarchy?.sub_activities || []).filter(
    (sa) => !draftFilters.activity_id || String(sa.activity_id) === String(draftFilters.activity_id)
  );

  const handleApplyFilter = () => {
    setAppliedFilters({ ...draftFilters });
  };

  const handleResetFilters = () => {
    const empty: DefectThresholdFilters = {
      project_id: '',
      division_id: '',
      sub_division_id: '',
      activity_id: '',
      sub_activity_id: '',
      severity_index: '',
      control_index: '',
    };
    setDraftFilters(empty);
    setAppliedFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters =
    Object.values(appliedFilters).some((v) => v && v !== '') || searchQuery.trim() !== '';

  const startInlineEdit = (row: DefectThresholdMapping) => {
    setEditingId(row.id);
    setEditValues({
      defect_type: row.defect_type,
      defect_threshold: row.defect_threshold,
      sporadic_threshold: row.sporadic_threshold,
      chronic_threshold: row.chronic_threshold,
      severity_index: row.severity_index,
      control_index: row.control_index,
    });
  };

  const saveInlineEdit = async (id: number) => {
    try {
      const updated = await qmsApi.updateDefectThreshold(id, editValues);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      setEditingId(null);
      triggerToast(`Updated threshold rule for "${updated.defect_type}"`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRow = async (row: DefectThresholdMapping) => {
    try {
      await qmsApi.deleteDefectThreshold(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      onRefreshHierarchy();
      triggerToast(`Deleted "${row.defect_type}" threshold mapping`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.defect_type.trim()) return;
    try {
      const created = await qmsApi.createDefectThreshold(newRule);
      setRows((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewRule({
        ...newRule,
        defect_type: '',
      });
      onRefreshHierarchy();
      triggerToast(`Added new defect threshold rule: "${created.defect_type}"`);
    } catch (err) {
      console.error(err);
    }
  };

  const displayedRows = showAll ? rows : rows.slice(0, 6);

  return (
    <div className="flex-1 min-h-screen bg-[#F4F5F7] px-8 py-6">
      {/* Top Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-6 z-50 bg-[#1B1B1B] text-white px-4 py-2.5 rounded-xl shadow-lg border border-[#C5A06E]/40 text-xs font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C5A06E]" />
          {toastMessage}
        </div>
      )}

      {/* Top Header (Exact match to Screenshot 1) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-[26px] font-medium text-[#18181B] tracking-tight">
          Defect Threshold Mapping
        </h1>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-[330px]">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white pl-10 pr-4 py-2.5 rounded-lg text-[13.5px] text-gray-800 placeholder-gray-400 border border-gray-100 shadow-2xs focus:outline-none focus:border-gray-300"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-3.5 py-2.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            title="Add New Defect Threshold Rule"
          >
            <Plus className="w-4 h-4 text-[#B89768]" />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      {/* Main White Card Container (Exact match to Screenshot 1) */}
      <div className="bg-white rounded-[20px] shadow-2xs border border-gray-100/80 px-8 py-7">
        {/* 7-Dropdown Cascading Filter Bar + Black Filter Button */}
        <div className="flex flex-wrap items-center gap-3 pb-7">
          {/* 1. Project */}
          <div className="relative">
            <select
              value={draftFilters.project_id || ''}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  project_id: e.target.value,
                  division_id: '',
                  sub_division_id: '',
                })
              }
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-8 py-2 text-[13px] text-gray-600 font-normal hover:border-gray-300 focus:outline-none cursor-pointer min-w-[96px]"
            >
              <option value="">Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 2. Division */}
          <div className="relative">
            <select
              value={draftFilters.division_id || ''}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  division_id: e.target.value,
                  sub_division_id: '',
                })
              }
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-8 py-2 text-[13px] text-gray-600 font-normal hover:border-gray-300 focus:outline-none cursor-pointer min-w-[98px]"
            >
              <option value="">Division</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 3. Sub-Division */}
          <div className="relative">
            <select
              value={draftFilters.sub_division_id || ''}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  sub_division_id: e.target.value,
                })
              }
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-8 py-2 text-[13px] text-gray-600 font-normal hover:border-gray-300 focus:outline-none cursor-pointer min-w-[125px]"
            >
              <option value="">Sub-Division</option>
              {subDivisions.map((sd) => (
                <option key={sd.id} value={sd.id}>
                  {sd.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 4. Activity */}
          <div className="relative">
            <select
              value={draftFilters.activity_id || ''}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  activity_id: e.target.value,
                  sub_activity_id: '',
                })
              }
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-8 py-2 text-[13px] text-gray-600 font-normal hover:border-gray-300 focus:outline-none cursor-pointer min-w-[96px]"
            >
              <option value="">Activity</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 5. Sub-Activity */}
          <div className="relative">
            <select
              value={draftFilters.sub_activity_id || ''}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  sub_activity_id: e.target.value,
                })
              }
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-8 py-2 text-[13px] text-gray-600 font-normal hover:border-gray-300 focus:outline-none cursor-pointer min-w-[122px]"
            >
              <option value="">Sub-Activity</option>
              {subActivities.map((sa) => (
                <option key={`${sa.id}-${sa.name}`} value={sa.id}>
                  {sa.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 6. Severity */}
          <div className="relative">
            <select
              value={draftFilters.severity_index || ''}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  severity_index: e.target.value,
                })
              }
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-8 py-2 text-[13px] text-gray-600 font-normal hover:border-gray-300 focus:outline-none cursor-pointer min-w-[98px]"
            >
              <option value="">Severity</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  Severity {n}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 7. Control */}
          <div className="relative">
            <select
              value={draftFilters.control_index || ''}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  control_index: e.target.value,
                })
              }
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-8 py-2 text-[13px] text-gray-600 font-normal hover:border-gray-300 focus:outline-none cursor-pointer min-w-[95px]"
            >
              <option value="">Control</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  Control {n}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Primary Black Filter Button */}
          <button
            onClick={handleApplyFilter}
            className="bg-black hover:bg-neutral-800 text-white text-[13px] font-medium px-8 py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
          >
            Filter
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-gray-500 hover:text-black flex items-center gap-1 px-2.5 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Data Table (Exact match to Screenshot 1) */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200/80 text-[12.5px] font-medium text-[#27272A]">
                <th className="text-left py-3.5 pl-2 pr-4 font-medium w-[24%]">Defect Type</th>
                <th className="text-center py-3.5 px-3 font-medium">Defect Threshold</th>
                <th className="text-center py-3.5 px-3 font-medium">Sporadic Threshold</th>
                <th className="text-center py-3.5 px-3 font-medium">Chronic Threshold</th>
                <th className="text-center py-3.5 px-3 font-medium">Severity Index</th>
                <th className="text-center py-3.5 px-3 font-medium">Control Index</th>
                <th className="text-center py-3.5 pl-4 pr-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px] text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading defect threshold mappings...
                  </td>
                </tr>
              ) : displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No defect threshold mappings match the current filters.
                  </td>
                </tr>
              ) : (
                displayedRows.map((row) => {
                  const isEditing = editingId === row.id;

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50/60 transition group"
                    >
                      {/* Defect Type */}
                      <td className="py-4 pl-2 pr-4 text-[#52525B] font-normal">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValues.defect_type ?? row.defect_type}
                            onChange={(e) =>
                              setEditValues({ ...editValues, defect_type: e.target.value })
                            }
                            className="w-full border border-[#B89768] rounded-lg px-2.5 py-1.5 text-[13px] text-gray-900 focus:outline-none"
                          />
                        ) : (
                          <div>
                            <div>{row.defect_type}</div>
                            {row.activity_name && hasActiveFilters && (
                              <div className="text-[11px] text-gray-400 mt-0.5">
                                {row.project_name} • {row.activity_name}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 1. Defect Threshold Pill */}
                      <td className="py-4 px-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues.defect_threshold ?? row.defect_threshold}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                defect_threshold: Number(e.target.value),
                              })
                            }
                            className="w-[74px] h-[36px] text-center border-2 border-[#B89768] rounded-xl text-[13px] font-medium text-gray-900 focus:outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => startInlineEdit(row)}
                            title="Click to edit threshold"
                            className="inline-flex items-center justify-center w-[74px] h-[36px] border border-gray-200/90 rounded-xl text-[12.5px] text-gray-500 bg-white hover:border-gray-400 cursor-pointer transition"
                          >
                            {row.defect_threshold}
                          </span>
                        )}
                      </td>

                      {/* 2. Sporadic Threshold Pill */}
                      <td className="py-4 px-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues.sporadic_threshold ?? row.sporadic_threshold}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                sporadic_threshold: Number(e.target.value),
                              })
                            }
                            className="w-[74px] h-[36px] text-center border-2 border-[#B89768] rounded-xl text-[13px] font-medium text-gray-900 focus:outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => startInlineEdit(row)}
                            title="Click to edit threshold"
                            className="inline-flex items-center justify-center w-[74px] h-[36px] border border-gray-200/90 rounded-xl text-[12.5px] text-gray-500 bg-white hover:border-gray-400 cursor-pointer transition"
                          >
                            {row.sporadic_threshold}
                          </span>
                        )}
                      </td>

                      {/* 3. Chronic Threshold Pill */}
                      <td className="py-4 px-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues.chronic_threshold ?? row.chronic_threshold}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                chronic_threshold: Number(e.target.value),
                              })
                            }
                            className="w-[74px] h-[36px] text-center border-2 border-[#B89768] rounded-xl text-[13px] font-medium text-gray-900 focus:outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => startInlineEdit(row)}
                            title="Click to edit threshold"
                            className="inline-flex items-center justify-center w-[74px] h-[36px] border border-gray-200/90 rounded-xl text-[12.5px] text-gray-500 bg-white hover:border-gray-400 cursor-pointer transition"
                          >
                            {row.chronic_threshold}
                          </span>
                        )}
                      </td>

                      {/* 4. Severity Index Pill */}
                      <td className="py-4 px-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={editValues.severity_index ?? row.severity_index}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                severity_index: Number(e.target.value),
                              })
                            }
                            className="w-[74px] h-[36px] text-center border-2 border-[#B89768] rounded-xl text-[13px] font-medium text-gray-900 focus:outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => startInlineEdit(row)}
                            title="Click to edit index"
                            className="inline-flex items-center justify-center w-[74px] h-[36px] border border-gray-200/90 rounded-xl text-[12.5px] text-gray-500 bg-white hover:border-gray-400 cursor-pointer transition"
                          >
                            {row.severity_index}
                          </span>
                        )}
                      </td>

                      {/* 5. Control Index Pill */}
                      <td className="py-4 px-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={editValues.control_index ?? row.control_index}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                control_index: Number(e.target.value),
                              })
                            }
                            className="w-[74px] h-[36px] text-center border-2 border-[#B89768] rounded-xl text-[13px] font-medium text-gray-900 focus:outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => startInlineEdit(row)}
                            title="Click to edit index"
                            className="inline-flex items-center justify-center w-[74px] h-[36px] border border-gray-200/90 rounded-xl text-[12.5px] text-gray-500 bg-white hover:border-gray-400 cursor-pointer transition"
                          >
                            {row.control_index}
                          </span>
                        )}
                      </td>

                      {/* Action Column: Edit Pencil | Delete Trash */}
                      <td className="py-4 pl-4 pr-2 text-center">
                        {isEditing ? (
                          <div className="inline-flex items-center justify-center gap-2">
                            <button
                              onClick={() => saveInlineEdit(row.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-3.5 text-gray-700">
                            <button
                              onClick={() => startInlineEdit(row)}
                              className="hover:text-[#B89768] transition cursor-pointer"
                              title="Edit Defect Threshold"
                            >
                              <Pencil className="w-[17px] h-[17px] stroke-[1.7]" />
                            </button>
                            <span className="h-4 w-[1px] bg-gray-200" />
                            <button
                              onClick={() => handleDeleteRow(row)}
                              className="hover:text-red-600 transition cursor-pointer"
                              title="Delete Defect Threshold"
                            >
                              <Trash2 className="w-[17px] h-[17px] stroke-[1.7]" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Centered "See All >" Button (Exact match to Screenshot 1) */}
        {rows.length > 6 && (
          <div className="mt-7 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="bg-black hover:bg-neutral-800 text-white text-[12px] font-medium px-6 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <span>{showAll ? 'Show Less' : 'See All'}</span>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${showAll ? '-rotate-90' : ''}`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Modal to Add New Defect Threshold Mapping */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Defect Threshold Mapping
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Defect Type Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Water Seepage at Window Sill"
                  value={newRule.defect_type}
                  onChange={(e) => setNewRule({ ...newRule, defect_type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Project</label>
                  <select
                    value={newRule.project_id}
                    onChange={(e) =>
                      setNewRule({ ...newRule, project_id: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Activity</label>
                  <select
                    value={newRule.activity_id}
                    onChange={(e) =>
                      setNewRule({ ...newRule, activity_id: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  >
                    {(hierarchy?.activities || []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Defect Threshold
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newRule.defect_threshold}
                    onChange={(e) =>
                      setNewRule({ ...newRule, defect_threshold: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Sporadic Threshold
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newRule.sporadic_threshold}
                    onChange={(e) =>
                      setNewRule({ ...newRule, sporadic_threshold: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Chronic Threshold
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newRule.chronic_threshold}
                    onChange={(e) =>
                      setNewRule({ ...newRule, chronic_threshold: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Severity Index (1–10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newRule.severity_index}
                    onChange={(e) =>
                      setNewRule({ ...newRule, severity_index: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Control Index (1–10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newRule.control_index}
                    onChange={(e) =>
                      setNewRule({ ...newRule, control_index: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-black text-white hover:bg-neutral-800 cursor-pointer"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
